import { Map as ImmutableMap, fromJS } from 'immutable';
import trim from 'lodash/trim';
import { create, Draft } from 'mutative';
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

const authUserSchema = v.object({
  access_token: v.string(),
  id: v.string(),
  url: v.string(),
});

interface AuthUser {
  access_token: string;
  id: string;
  url: string;
}

interface State {
  app: CredentialApplication | null;
  tokens: Record<string, Token>;
  users: Record<string, AuthUser>;
  me: string | null;
  client: InstanceType<typeof PlApiClient>;
}

const buildKey = (parts: string[]) => parts.join(':');

// For subdirectory support
const NAMESPACE = trim(BuildConfig.FE_SUBDIRECTORY, '/') ? `pl-fe@${BuildConfig.FE_SUBDIRECTORY}` : 'pl-fe';

const STORAGE_KEY = buildKey([NAMESPACE, 'auth']);
const SESSION_KEY = buildKey([NAMESPACE, 'auth', 'me']);

const getSessionUser = () => {
  const id = sessionStorage.getItem(SESSION_KEY);
  return validId(id) ? id : undefined;
};

const getLocalState = (): State | undefined => {
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY)!);

  if (!state) return undefined;

  return ({
    app: state.app && v.parse(applicationSchema, state.app),
    tokens: Object.fromEntries(Object.entries(state.tokens).map(([key, value]) => [key, v.parse(tokenSchema, value)])),
    users: Object.fromEntries(Object.entries(state.users).map(([key, value]) => [key, v.parse(authUserSchema, value)])),
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
const firstValidUser = (state: State | Draft<State>) => Object.values(state.users).find(validUser);

// For legacy purposes. IDs get upgraded to URLs further down.
const getUrlOrId = (user?: AuthUser): string | null => {
  try {
    if (!user) return null;
    const { id, url } = user;
    return (url || id);
  } catch {
    return null;
  }
};

// If `me` doesn't match an existing user, attempt to shift it.
const maybeShiftMe = (state: State | Draft<State>) => {
  const me = state.me!;
  const user = state.users[me];

  if (!validUser(user)) {
    const nextUser = firstValidUser(state);
    state.me = getUrlOrId(nextUser);
  } else {
    return state;
  }
};

// Set the user from the session or localStorage, whichever is valid first
const setSessionUser = (state: State) => {
  const me = getUrlOrId([
    state.users[sessionUser!]!,
    state.users[state.me!]!,
  ].find(validUser));

  state.me = me;
};

const isUpgradingUrlId = (state: State) => {
  const me = state.me;
  const user = state.users[me!];
  return validId(me) && user && !isURL(me);
};

// Checks the state and makes it valid
const sanitizeState = (state: State) => {
  // Skip sanitation during ID to URL upgrade
  if (isUpgradingUrlId(state)) return state;

  state.users = Object.fromEntries(Object.entries(state.users).filter(([url, user]) => (
    validUser(user) && user.url === url
  )));
  // Remove mismatched tokens
  state.tokens = Object.fromEntries(Object.entries(state.tokens).filter(([id, token]) => (
    validId(id) && token.access_token === id
  )));
};

const persistAuth = (state: State) => {
  const { client, ...data } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

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

const initialize = (state: State) => {
  maybeShiftMe(state);
  setSessionUser(state);
  sanitizeState(state);
  persistState(state);

  return state;
};

const initialState: State = initialize({
  app: null,
  tokens: {},
  users: {},
  me: null,
  client: new PlApiClient(backendUrl),
  ...localState,
});

const importToken = (state: State | Draft<State>, token: Token) => {
  state.tokens[token.access_token] = token;
};

// Users are now stored by their ActivityPub ID instead of their
// primary key to support auth against multiple hosts.
const upgradeNonUrlId = (state: State | Draft<State>, account: CredentialAccount) => {
  const me = state.me;
  if (isURL(me)) return state;

  state.me = state.me === account.id ? account.url : state.me;
  delete state.users[account.id];
};

// Returns a predicate function for filtering a mismatched user/token
const userMismatch = (token: string, account: CredentialAccount) =>
  (user: AuthUser, url: string) => {
    const sameToken = user.access_token === token;
    const differentUrl = url !== account.url || user.url !== account.url;
    const differentId = user.id !== account.id;

    return sameToken && (differentUrl || differentId);
  };

const importCredentials = (state: State | Draft<State>, token: string, account: CredentialAccount) => {
  state.users[account.url] = v.parse(authUserSchema, {
    id: account.id,
    access_token: token,
    url: account.url,
  });
  // state.tokens[token].account = account.id;
  state.tokens[token].me = account.url;
  state.users = Object.fromEntries(Object.entries(state.users).filter(([url, user]) => userMismatch(token, account)(user, url)));
  if (!state.me) {
    if (state.client.baseURL === parseBaseURL(account.url)) state.client.accessToken = token;
    else state.client = new PlApiClient(parseBaseURL(account.url) || backendUrl, token);
  }
  state.me = state.me || account.url;
  upgradeNonUrlId(state, account);
};

const deleteToken = (state: State | Draft<State>, token: string) => {
  delete state.tokens[token];
  state.users = Object.fromEntries(Object.entries(state.users).filter(([_, user]) => user.access_token !== token));
  maybeShiftMe(state);
};

const deleteUser = (state: State | Draft<State>, account: Pick<AccountEntity, 'url'>) => {
  const accountUrl = account.url;

  delete state.users[accountUrl];
  state.tokens = Object.fromEntries(Object.entries(state.tokens).filter(([_, token]) => token.me !== accountUrl));
  maybeShiftMe(state);
};

const importMastodonPreload = (state: State | Draft<State>, data: ImmutableMap<string, any>) => {
  const accountId = data.getIn(['meta', 'me']) as string;
  const accountUrl = data.getIn(['accounts', accountId, 'url']) as string;
  const accessToken = data.getIn(['meta', 'access_token']) as string;

  if (validId(accessToken) && validId(accountId) && isURL(accountUrl)) {
    state.tokens[accessToken] = v.parse(tokenSchema, {
      access_token: accessToken,
      account: accountId,
      me: accountUrl,
      scope: 'read write follow push',
      token_type: 'Bearer',
    });

    state.users[accountUrl] = v.parse(authUserSchema, {
      id: accountId,
      access_token: accessToken,
      url: accountUrl,
    });
  }

  maybeShiftMe(state);
};

const persistAuthAccount = (account: CredentialAccount) => {
  const persistedAccount = { ...account };
  const key = `authAccount:${account.url}`;

  KVStore.getItem(key).then((oldAccount: any) => {
    const settings = oldAccount?.settings_store || {};
    if (!persistedAccount.settings_store) {
      persistedAccount.settings_store = settings;
    }
    KVStore.setItem(key, persistedAccount);
  })
    .catch(console.error);

  return persistedAccount;
};

const deleteForbiddenToken = (state: State | Draft<State>, error: { response: PlfeResponse }, token: string) => {
  if ([401, 403].includes(error.response?.status!)) {
    return deleteToken(state, token);
  } else {
    return state;
  }
};

const reducer = (state: State, action: AnyAction | AuthAction | MeAction | PreloadAction): State => {
  switch (action.type) {
    case AUTH_APP_CREATED:
      return create(state, (draft) => {
        draft.app = action.app;
      });
    case AUTH_APP_AUTHORIZED:
      return create(state, (draft) => {
        draft.app = ({ ...draft.app, ...action.token });
      });
    case AUTH_LOGGED_IN:
      return create(state, (draft) => {
        importToken(draft, action.token);
      });
    case AUTH_LOGGED_OUT:
      return create(state, (draft) => {
        deleteUser(draft, action.account);
      });
    case VERIFY_CREDENTIALS_SUCCESS:
      return create(state, (draft) => {
        importCredentials(draft, action.token, persistAuthAccount(action.account));
      });
    case VERIFY_CREDENTIALS_FAIL:
      return create(state, (draft) => {
        deleteForbiddenToken(draft, action.error, action.token);
      });
    case SWITCH_ACCOUNT:
      return create(state, (draft) => {
        draft.me = action.account.url;
        if (draft.client.baseURL === parseBaseURL(action.account.url)) {
          draft.client.accessToken = action.account.access_token;
        } else {
          draft.client = new PlApiClient(parseBaseURL(action.account.url) || backendUrl, action.account.access_token);
        }
      });
    case ME_FETCH_SKIP:
      return create(state, (draft) => {
        draft.me = null;
      });
    case MASTODON_PRELOAD_IMPORT:
      return create(state, (draft) => {
        importMastodonPreload(draft, fromJS<ImmutableMap<string, any>>(action.data));
      });
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
  const userUpgradedUrl = state.users[me!]?.id === oldMe;

  return stillValid && didChange && !userUpgradedUrl;
};

const maybeReload = (oldState: State, state: State, action: AnyAction) => {
  const loggedOutStandalone = action.type === AUTH_LOGGED_OUT && action.standalone;
  const switched = userSwitched(oldState, state);

  if (switched || loggedOutStandalone) {
    reload();
  }
};

const auth = (oldState: State = initialState, action: AnyAction): State => {
  const state = reducer(oldState, action);

  if (state !== oldState) {
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

export { auth as default };
