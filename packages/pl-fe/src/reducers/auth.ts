import { List as ImmutableList, Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';
import trim from 'lodash/trim';
import { applicationSchema, PlApiClient, tokenSchema, type CredentialAccount, type CredentialApplication, type Token } from 'pl-api';
import * as v from 'valibot';

import { MASTODON_PRELOAD_IMPORT, type PreloadAction } from 'pl-fe/actions/preload';
import * as BuildConfig from 'pl-fe/build-config';
import KVStore from 'pl-fe/storage/kv-store';
import { validId, isURL, parseBaseURL } from 'pl-fe/utils/auth';

import {
  AUTH_APP_CREATED,
  AUTH_LOGGED_IN,
  AUTH_APP_AUTHORIZED,
  AUTH_LOGGED_OUT,
  SWITCH_ACCOUNT,
  VERIFY_CREDENTIALS_SUCCESS,
  VERIFY_CREDENTIALS_FAIL,
  type AuthAction,
} from '../actions/auth';
import { ME_FETCH_SKIP, type MeAction } from '../actions/me';

import type { PlfeResponse } from 'pl-fe/api';
import type { Account as AccountEntity } from 'pl-fe/normalizers/account';
import type { AnyAction } from 'redux';

const backendUrl = (isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : '');

const AuthUserRecord = ImmutableRecord({
  access_token: '',
  id: '',
  url: '',
});

const ReducerRecord = ImmutableRecord({
  app: null as CredentialApplication | null,
  tokens: ImmutableMap<string, Token>(),
  users: ImmutableMap<string, AuthUser>(),
  me: null as string | null,
  client: new PlApiClient(backendUrl),
});

type AuthUser = ReturnType<typeof AuthUserRecord>;
type State = ReturnType<typeof ReducerRecord>;

const buildKey = (parts: string[]) => parts.join(':');

// For subdirectory support
const NAMESPACE = trim(BuildConfig.FE_SUBDIRECTORY, '/') ? `pl-fe@${BuildConfig.FE_SUBDIRECTORY}` : 'pl-fe';

const STORAGE_KEY = buildKey([NAMESPACE, 'auth']);
const SESSION_KEY = buildKey([NAMESPACE, 'auth', 'me']);

const getSessionUser = () => {
  const id = sessionStorage.getItem(SESSION_KEY);
  return validId(id) ? id : undefined;
};

const getLocalState = () => {
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY)!);

  if (!state) return undefined;

  return ReducerRecord({
    app: state.app && v.parse(applicationSchema, state.app),
    tokens: ImmutableMap(Object.entries(state.tokens).map(([key, value]) => [key, v.parse(tokenSchema, value)])),
    users: ImmutableMap(Object.entries(state.users).map(([key, value]) => [key, AuthUserRecord(value as any)])),
    me: state.me,
    client: new PlApiClient(parseBaseURL(state.me) || backendUrl, state.users[state.me]?.access_token),
  });
};

const sessionUser = getSessionUser();
const localState = getLocalState();

// Checks if the user has an ID and access token
const validUser = (user?: AuthUser) => {
  try {
    return !!(user && validId(user.id) && validId(user.access_token));
  } catch (e) {
    return false;
  }
};

// Finds the first valid user in the state
const firstValidUser = (state: State) => state.users.find(validUser);

// For legacy purposes. IDs get upgraded to URLs further down.
const getUrlOrId = (user?: AuthUser): string | null => {
  try {
    const { id, url } = user!.toJS();
    return (url || id) as string;
  } catch {
    return null;
  }
};

// If `me` doesn't match an existing user, attempt to shift it.
const maybeShiftMe = (state: State) => {
  const me = state.me!;
  const user = state.users.get(me);

  if (!validUser(user)) {
    const nextUser = firstValidUser(state);
    return state.set('me', getUrlOrId(nextUser));
  } else {
    return state;
  }
};

// Set the user from the session or localStorage, whichever is valid first
const setSessionUser = (state: State) => state.update('me', me => {
  const user = ImmutableList<AuthUser>([
    state.users.get(sessionUser!)!,
    state.users.get(me!)!,
  ]).find(validUser);

  return getUrlOrId(user);
});

const isUpgradingUrlId = (state: State) => {
  const me = state.me;
  const user = state.users.get(me!);
  return validId(me) && user && !isURL(me);
};

// Checks the state and makes it valid
const sanitizeState = (state: State) => {
  // Skip sanitation during ID to URL upgrade
  if (isUpgradingUrlId(state)) return state;

  return state.withMutations(state => {
    // Remove invalid users, ensure ID match
    state.update('users', users => (
      users.filter((user, url) => (
        validUser(user) && user.get('url') === url
      ))
    ));
    // Remove mismatched tokens
    state.update('tokens', tokens => (
      tokens.filter((token, id) => (
        validId(id) && token.access_token === id
      ))
    ));
  });
};

const persistAuth = (state: State) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state.toJS()));

const persistSession = (state: State) => {
  const me = state.me;
  if (me && typeof me === 'string') {
    sessionStorage.setItem(SESSION_KEY, me);
  }
};

const persistState = (state: State) => {
  persistAuth(state);
  persistSession(state);
};

const initialize = (state: State) =>
  state.withMutations(state => {
    maybeShiftMe(state);
    setSessionUser(state);
    sanitizeState(state);
    persistState(state);
  });

const initialState = initialize(ReducerRecord().merge(localState as any));

const importToken = (state: State, token: Token) =>
  state.setIn(['tokens', token.access_token], token);

// Users are now stored by their ActivityPub ID instead of their
// primary key to support auth against multiple hosts.
const upgradeNonUrlId = (state: State, account: CredentialAccount) => {
  const me = state.me;
  if (isURL(me)) return state;

  return state.withMutations(state => {
    state.update('me', me => me === account.id ? account.url : me);
    state.deleteIn(['users', account.id]);
  });
};

// Returns a predicate function for filtering a mismatched user/token
const userMismatch = (token: string, account: CredentialAccount) =>
  (user: AuthUser, url: string) => {
    const sameToken = user.get('access_token') === token;
    const differentUrl = url !== account.url || user.get('url') !== account.url;
    const differentId = user.get('id') !== account.id;

    return sameToken && (differentUrl || differentId);
  };

const importCredentials = (state: State, token: string, account: CredentialAccount) =>
  state.withMutations(state => {
    state.setIn(['users', account.url], AuthUserRecord({
      id: account.id,
      access_token: token,
      url: account.url,
    }));
    state.setIn(['tokens', token, 'account'], account.id);
    state.setIn(['tokens', token, 'me'], account.url);
    state.update('users', users => users.filterNot(userMismatch(token, account)));
    state.update('client', client =>
      state.me
        ? client
        : client.baseURL === parseBaseURL(account.url)
          ? (client.accessToken = token, client)
          : new PlApiClient(parseBaseURL(account.url) || backendUrl, token),
    );
    state.update('me', me => me || account.url);
    upgradeNonUrlId(state, account);
  });

const deleteToken = (state: State, token: string) =>
  state.withMutations(state => {
    state.update('tokens', tokens => tokens.delete(token));
    state.update('users', users => users.filterNot(user => user.get('access_token') === token));
    maybeShiftMe(state);
  });

const deleteUser = (state: State, account: Pick<AccountEntity, 'url'>) => {
  const accountUrl = account.url;

  return state.withMutations(state => {
    state.update('users', users => users.delete(accountUrl));
    state.update('tokens', tokens => tokens.filterNot(token => token.me === accountUrl));
    maybeShiftMe(state);
  });
};

const importMastodonPreload = (state: State, data: ImmutableMap<string, any>) =>
  state.withMutations(state => {
    const accountId = data.getIn(['meta', 'me']) as string;
    const accountUrl = data.getIn(['accounts', accountId, 'url']) as string;
    const accessToken = data.getIn(['meta', 'access_token']) as string;

    if (validId(accessToken) && validId(accountId) && isURL(accountUrl)) {
      state.setIn(['tokens', accessToken], v.parse(tokenSchema, {
        access_token: accessToken,
        account: accountId,
        me: accountUrl,
        scope: 'read write follow push',
        token_type: 'Bearer',
      }));

      state.setIn(['users', accountUrl], AuthUserRecord({
        id: accountId,
        access_token: accessToken,
        url: accountUrl,
      }));
    }

    maybeShiftMe(state);
  });

const persistAuthAccount = (account: CredentialAccount) => {
  if (account && account.url) {
    const key = `authAccount:${account.url}`;
    KVStore.getItem(key).then((oldAccount: any) => {
      const settings = oldAccount?.settings_store || {};
      if (!account.settings_store) {
        account.settings_store = settings;
      }
      KVStore.setItem(key, account);
    })
      .catch(console.error);
  }
};

const deleteForbiddenToken = (state: State, error: { response: PlfeResponse }, token: string) => {
  if ([401, 403].includes(error.response?.status!)) {
    return deleteToken(state, token);
  } else {
    return state;
  }
};

const reducer = (state: State, action: AnyAction | AuthAction | MeAction | PreloadAction) => {
  switch (action.type) {
    case AUTH_APP_CREATED:
      return state.set('app', action.app);
    case AUTH_APP_AUTHORIZED:
      return state.update('app', app => ({ ...app, ...action.token }));
    case AUTH_LOGGED_IN:
      return importToken(state, action.token);
    case AUTH_LOGGED_OUT:
      return deleteUser(state, action.account);
    case VERIFY_CREDENTIALS_SUCCESS:
      persistAuthAccount(action.account);
      return importCredentials(state, action.token, action.account);
    case VERIFY_CREDENTIALS_FAIL:
      return deleteForbiddenToken(state, action.error, action.token);
    case SWITCH_ACCOUNT:
      return state
        .set('me', action.account.url)
        .update('client', client =>
          client.baseURL === parseBaseURL(action.account.url)
            ? (client.accessToken = action.account.access_token, client)
            : new PlApiClient(parseBaseURL(action.account.url) || backendUrl, action.account.access_token),
        );
    case ME_FETCH_SKIP:
      return state.set('me', null);
    case MASTODON_PRELOAD_IMPORT:
      return importMastodonPreload(state, fromJS(action.data) as ImmutableMap<string, any>);
    default:
      return state;
  }
};

const reload = () => location.replace('/');

// `me` is a user ID string
const validMe = (state: State) => {
  const me = state.me;
  return typeof me === 'string';
};

// `me` has changed from one valid ID to another
const userSwitched = (oldState: State, state: State) => {
  const me = state.me;
  const oldMe = oldState.me;

  const stillValid = validMe(oldState) && validMe(state);
  const didChange = oldMe !== me;
  const userUpgradedUrl = state.users.get(me!)?.id === oldMe;

  return stillValid && didChange && !userUpgradedUrl;
};

const maybeReload = (oldState: State, state: State, action: AnyAction) => {
  const loggedOutStandalone = action.type === AUTH_LOGGED_OUT && action.standalone;
  const switched = userSwitched(oldState, state);

  if (switched || loggedOutStandalone) {
    reload();
  }
};

const auth = (oldState: State = initialState, action: AnyAction) => {
  const state = reducer(oldState, action);

  if (!state.equals(oldState)) {
    // Persist the state in localStorage
    persistAuth(state);

    // When middle-clicking a profile, we want to save the
    // user in localStorage, but not update the reducer
    if (action.background === true) {
      return oldState;
    }

    // Persist the session
    persistSession(state);

    // Reload the page under some conditions
    maybeReload(oldState, state, action);
  }

  return state;
};

export {
  AuthUserRecord,
  ReducerRecord,
  auth as default,
};
