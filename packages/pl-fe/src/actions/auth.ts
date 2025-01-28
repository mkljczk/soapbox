/**
 * Auth: login & registration workflow.
 * This file contains abstractions over auth concepts.
 * @module pl-fe/actions/auth
 * @see module:pl-fe/actions/apps
 * @see module:pl-fe/actions/oauth
 * @see module:pl-fe/actions/security
*/
import {
  credentialAccountSchema,
  PlApiClient,
  type CreateAccountParams,
  type CredentialAccount,
  type CredentialApplication,
  type Token,
} from 'pl-api';
import { defineMessages } from 'react-intl';
import * as v from 'valibot';

import { createAccount } from 'pl-fe/actions/accounts';
import { createApp } from 'pl-fe/actions/apps';
import { fetchMeSuccess, fetchMeFail } from 'pl-fe/actions/me';
import { obtainOAuthToken, revokeOAuthToken } from 'pl-fe/actions/oauth';
import { startOnboarding } from 'pl-fe/actions/onboarding';
import * as BuildConfig from 'pl-fe/build-config';
import { custom } from 'pl-fe/custom';
import { queryClient } from 'pl-fe/queries/client';
import { selectAccount } from 'pl-fe/selectors';
import { unsetSentryAccount } from 'pl-fe/sentry';
import KVStore from 'pl-fe/storage/kv-store';
import toast from 'pl-fe/toast';
import { getLoggedInAccount, parseBaseURL } from 'pl-fe/utils/auth';
import sourceCode from 'pl-fe/utils/code';
import { normalizeUsername } from 'pl-fe/utils/input';
import { getScopes } from 'pl-fe/utils/scopes';
import { isStandalone } from 'pl-fe/utils/state';

import { type PlfeResponse, getClient } from '../api';

import { importEntities } from './importer';

import type { Account } from 'pl-fe/normalizers/account';
import type { AppDispatch, RootState } from 'pl-fe/store';

const SWITCH_ACCOUNT = 'SWITCH_ACCOUNT' as const;

const AUTH_APP_CREATED = 'AUTH_APP_CREATED' as const;
const AUTH_APP_AUTHORIZED = 'AUTH_APP_AUTHORIZED' as const;
const AUTH_LOGGED_IN = 'AUTH_LOGGED_IN' as const;
const AUTH_LOGGED_OUT = 'AUTH_LOGGED_OUT' as const;

const VERIFY_CREDENTIALS_SUCCESS = 'VERIFY_CREDENTIALS_SUCCESS' as const;
const VERIFY_CREDENTIALS_FAIL = 'VERIFY_CREDENTIALS_FAIL' as const;

const AUTH_ACCOUNT_REMEMBER_SUCCESS = 'AUTH_ACCOUNT_REMEMBER_SUCCESS' as const;

const customApp = custom('app');

const messages = defineMessages({
  loggedOut: { id: 'auth.logged_out', defaultMessage: 'Logged out.' },
  awaitingApproval: { id: 'auth.awaiting_approval', defaultMessage: 'Your account is awaiting approval' },
  invalidCredentials: { id: 'auth.invalid_credentials', defaultMessage: 'Wrong username or password' },
});

const noOp = () => new Promise(f => f(undefined));

const createAppAndToken = () =>
  (dispatch: AppDispatch) =>
    dispatch(getAuthApp()).then(() =>
      dispatch(createAppToken()),
    );

interface AuthAppCreatedAction {
  type: typeof AUTH_APP_CREATED;
  app: CredentialApplication;
}

/** Create an auth app, or use it from build config */
const getAuthApp = () =>
  (dispatch: AppDispatch) => {
    if (customApp?.client_secret) {
      return noOp().then(() => dispatch<AuthAppCreatedAction>({ type: AUTH_APP_CREATED, app: customApp }));
    } else {
      return dispatch(createAuthApp());
    }
  };

const createAuthApp = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const params = {
      client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
      redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: getScopes(getState()),
      website: sourceCode.homepage,
    };

    return createApp(params).then((app) =>
      dispatch<AuthAppCreatedAction>({ type: AUTH_APP_CREATED, app }),
    );
  };

interface AuthAppAuthorizedAction {
  type: typeof AUTH_APP_AUTHORIZED;
  app: CredentialApplication;
  token: Token;
}

const createAppToken = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const app = getState().auth.app!;

    const params = {
      client_id: app.client_id!,
      client_secret: app.client_secret!,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      grant_type: 'client_credentials',
      scope: getScopes(getState()),
    };

    return obtainOAuthToken(params).then((token) =>
      dispatch<AuthAppAuthorizedAction>({ type: AUTH_APP_AUTHORIZED, app, token }),
    );
  };

const createUserToken = (username: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const app = getState().auth.app;

    const params = {
      client_id: app?.client_id!,
      client_secret: app?.client_secret!,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      grant_type: 'password',
      username: username,
      password: password,
      scope: getScopes(getState()),
    };

    return obtainOAuthToken(params)
      .then((token) => dispatch(authLoggedIn(token)));
  };

const otpVerify = (code: string, mfa_token: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const app = state.auth.app;
    const baseUrl = parseBaseURL(state.me) || BuildConfig.BACKEND_URL;
    const client = new PlApiClient(baseUrl);
    return client.oauth.mfaChallenge({
      client_id: app?.client_id!,
      client_secret: app?.client_secret!,
      mfa_token: mfa_token,
      code: code,
      challenge_type: 'totp',
      // redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      // scope: getScopes(getState()),
    }).then((token) => dispatch(authLoggedIn(token)));
  };

interface VerifyCredentialsSuccessAction {
  type: typeof VERIFY_CREDENTIALS_SUCCESS;
  token: string;
  account: CredentialAccount;
}

interface VerifyCredentialsFailAction {
  type: typeof VERIFY_CREDENTIALS_FAIL;
  token: string;
  error: unknown;
}

const verifyCredentials = (token: string, accountUrl?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const baseURL = parseBaseURL(accountUrl) || BuildConfig.BACKEND_URL;

    const client = new PlApiClient(baseURL, token);

    return client.settings.verifyCredentials().then((account) => {
      dispatch(importEntities({ accounts: [account] }));
      dispatch<VerifyCredentialsSuccessAction>({ type: VERIFY_CREDENTIALS_SUCCESS, token, account });
      if (account.id === getState().me) dispatch(fetchMeSuccess(account));
      return account;
    }).catch(error => {
      if (error?.response?.status === 403 && error?.response?.json?.id) {
        // The user is waitlisted
        const account = error.response.json;
        const parsedAccount = v.parse(credentialAccountSchema, error.response.json);
        dispatch(importEntities({ accounts: [parsedAccount] }));
        dispatch<VerifyCredentialsSuccessAction>({ type: VERIFY_CREDENTIALS_SUCCESS, token, account: parsedAccount });
        if (account.id === getState().me) dispatch(fetchMeSuccess(parsedAccount));
        return parsedAccount;
      } else {
        if (getState().me === null) dispatch(fetchMeFail(error));
        dispatch<VerifyCredentialsFailAction>({ type: VERIFY_CREDENTIALS_FAIL, token, error });
        throw error;
      }
    });
  };

interface AuthAccountRememberSuccessAction {
  type: typeof AUTH_ACCOUNT_REMEMBER_SUCCESS;
  accountUrl: string;
  account: CredentialAccount;
}

const rememberAuthAccount = (accountUrl: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    KVStore.getItemOrError(`authAccount:${accountUrl}`).then(account => {
      dispatch(importEntities({ accounts: [account] }));
      dispatch<AuthAccountRememberSuccessAction>({ type: AUTH_ACCOUNT_REMEMBER_SUCCESS, account, accountUrl });
      if (account.id === getState().me) dispatch(fetchMeSuccess(account));
      return account;
    });

const loadCredentials = (token: string, accountUrl: string) =>
  (dispatch: AppDispatch) => dispatch(rememberAuthAccount(accountUrl))
    .finally(() => dispatch(verifyCredentials(token, accountUrl)));

const logIn = (username: string, password: string) =>
  (dispatch: AppDispatch) => dispatch(getAuthApp()).then(() =>
    dispatch(createUserToken(normalizeUsername(username), password)),
  ).catch((error: { response: PlfeResponse }) => {
    if ((error.response?.json as any)?.error === 'mfa_required') {
      // If MFA is required, throw the error and handle it in the component.
      throw error;
    } else if ((error.response?.json as any)?.identifier === 'awaiting_approval') {
      toast.error(messages.awaitingApproval);
    } else {
      // Return "wrong password" message.
      toast.error(messages.invalidCredentials);
    }
    throw error;
  });

interface AuthLoggedOutAction {
  type: typeof AUTH_LOGGED_OUT;
  account: Account;
  standalone: boolean;
}

const logOut = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const account = getLoggedInAccount(state);
    const standalone = isStandalone(state);

    if (!account) return dispatch(noOp);

    const params = {
      client_id: state.auth.app?.client_id!,
      client_secret: state.auth.app?.client_secret!,
      token: state.auth.users[account.url]!.access_token,
    };

    return dispatch(revokeOAuthToken(params))
      .finally(() => {
        // Clear all stored cache from React Query
        queryClient.invalidateQueries();
        queryClient.clear();

        // Clear the account from Sentry.
        unsetSentryAccount();

        dispatch<AuthLoggedOutAction>({ type: AUTH_LOGGED_OUT, account, standalone });

        toast.success(messages.loggedOut);
      });
  };

interface SwitchAccountAction {
  type: typeof SWITCH_ACCOUNT;
  account: Account;
}

const switchAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const account = selectAccount(getState(), accountId);
    if (!account) return;

    // Clear all stored cache from React Query
    queryClient.invalidateQueries();
    queryClient.clear();

    return dispatch<SwitchAccountAction>({ type: SWITCH_ACCOUNT, account });
  };

const fetchOwnAccounts = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    return Object.values(state.auth.users).forEach((user) => {
      const account = selectAccount(state, user.id);
      if (!account) {
        dispatch(verifyCredentials(user.access_token, user.url))
          .catch(() => console.warn(`Failed to load account: ${user.url}`));
      }
    });
  };

const register = (params: CreateAccountParams) =>
  (dispatch: AppDispatch) => {
    params.fullname = params.username;

    return dispatch(createAppAndToken())
      .then(() => dispatch(createAccount(params)))
      .then(({ token }: { token: Token }) => {
        dispatch(startOnboarding());
        return dispatch(authLoggedIn(token));
      });
  };

const fetchCaptcha = () =>
  (_dispatch: AppDispatch, getState: () => RootState) => getClient(getState).oauth.getCaptcha();

interface AuthLoggedInAction {
  type: typeof AUTH_LOGGED_IN;
  token: Token;
}

const authLoggedIn = (token: Token) =>
  (dispatch: AppDispatch) => {
    dispatch<AuthLoggedInAction>({ type: AUTH_LOGGED_IN, token });
    return token;
  };

type AuthAction =
  | SwitchAccountAction
  | AuthAppCreatedAction
  | AuthAppAuthorizedAction
  | AuthLoggedInAction
  | AuthLoggedOutAction
  | VerifyCredentialsSuccessAction
  | VerifyCredentialsFailAction
  | AuthAccountRememberSuccessAction;

export {
  SWITCH_ACCOUNT,
  AUTH_APP_CREATED,
  AUTH_APP_AUTHORIZED,
  AUTH_LOGGED_IN,
  AUTH_LOGGED_OUT,
  VERIFY_CREDENTIALS_SUCCESS,
  VERIFY_CREDENTIALS_FAIL,
  AUTH_ACCOUNT_REMEMBER_SUCCESS,
  messages,
  otpVerify,
  verifyCredentials,
  loadCredentials,
  logIn,
  logOut,
  switchAccount,
  fetchOwnAccounts,
  register,
  fetchCaptcha,
  authLoggedIn,
  type AuthAction,
};
