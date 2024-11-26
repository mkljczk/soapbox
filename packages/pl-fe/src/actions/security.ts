/**
 * Security: Pleroma-specific account management features.
 * @module pl-fe/actions/security
 * @see module:pl-fe/actions/auth
 */

import { getClient } from 'pl-fe/api';
import toast from 'pl-fe/toast';
import { getLoggedInAccount } from 'pl-fe/utils/auth';
import { normalizeUsername } from 'pl-fe/utils/input';

import { AUTH_LOGGED_OUT, messages } from './auth';

import type { OauthToken } from 'pl-api';
import type { Account } from 'pl-fe/normalizers/account';
import type { AppDispatch, RootState } from 'pl-fe/store';

const FETCH_TOKENS_REQUEST = 'FETCH_TOKENS_REQUEST' as const;
const FETCH_TOKENS_SUCCESS = 'FETCH_TOKENS_SUCCESS' as const;
const FETCH_TOKENS_FAIL = 'FETCH_TOKENS_FAIL' as const;

const REVOKE_TOKEN_REQUEST = 'REVOKE_TOKEN_REQUEST' as const;
const REVOKE_TOKEN_SUCCESS = 'REVOKE_TOKEN_SUCCESS' as const;
const REVOKE_TOKEN_FAIL = 'REVOKE_TOKEN_FAIL' as const;

const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST' as const;
const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS' as const;
const RESET_PASSWORD_FAIL = 'RESET_PASSWORD_FAIL' as const;

const RESET_PASSWORD_CONFIRM_REQUEST = 'RESET_PASSWORD_CONFIRM_REQUEST' as const;
const RESET_PASSWORD_CONFIRM_SUCCESS = 'RESET_PASSWORD_CONFIRM_SUCCESS' as const;
const RESET_PASSWORD_CONFIRM_FAIL = 'RESET_PASSWORD_CONFIRM_FAIL' as const;

const CHANGE_PASSWORD_REQUEST = 'CHANGE_PASSWORD_REQUEST' as const;
const CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS' as const;
const CHANGE_PASSWORD_FAIL = 'CHANGE_PASSWORD_FAIL' as const;

const CHANGE_EMAIL_REQUEST = 'CHANGE_EMAIL_REQUEST' as const;
const CHANGE_EMAIL_SUCCESS = 'CHANGE_EMAIL_SUCCESS' as const;
const CHANGE_EMAIL_FAIL = 'CHANGE_EMAIL_FAIL' as const;

const DELETE_ACCOUNT_REQUEST = 'DELETE_ACCOUNT_REQUEST' as const;
const DELETE_ACCOUNT_SUCCESS = 'DELETE_ACCOUNT_SUCCESS' as const;
const DELETE_ACCOUNT_FAIL = 'DELETE_ACCOUNT_FAIL' as const;

const MOVE_ACCOUNT_REQUEST = 'MOVE_ACCOUNT_REQUEST' as const;
const MOVE_ACCOUNT_SUCCESS = 'MOVE_ACCOUNT_SUCCESS' as const;
const MOVE_ACCOUNT_FAIL = 'MOVE_ACCOUNT_FAIL' as const;

const fetchOAuthTokens = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<SecurityAction>({ type: FETCH_TOKENS_REQUEST });
    return getClient(getState).settings.getOauthTokens().then((tokens) => {
      dispatch<SecurityAction>({ type: FETCH_TOKENS_SUCCESS, tokens });
    }).catch((e) => {
      dispatch<SecurityAction>({ type: FETCH_TOKENS_FAIL });
    });
  };

const revokeOAuthTokenById = (tokenId: number) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<SecurityAction>({ type: REVOKE_TOKEN_REQUEST, tokenId });
    return getClient(getState).settings.deleteOauthToken(tokenId).then(() => {
      dispatch<SecurityAction>({ type: REVOKE_TOKEN_SUCCESS, tokenId });
    }).catch(() => {
      dispatch<SecurityAction>({ type: REVOKE_TOKEN_FAIL, tokenId });
    });
  };

const changePassword = (oldPassword: string, newPassword: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<SecurityAction>({ type: CHANGE_PASSWORD_REQUEST });

    return getClient(getState).settings.changePassword(oldPassword, newPassword).then(response => {
      dispatch<SecurityAction>({ type: CHANGE_PASSWORD_SUCCESS, response });
    }).catch(error => {
      dispatch<SecurityAction>({ type: CHANGE_PASSWORD_FAIL, error, skipAlert: true });
      throw error;
    });
  };

const resetPassword = (usernameOrEmail: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const input = normalizeUsername(usernameOrEmail);

    dispatch<SecurityAction>({ type: RESET_PASSWORD_REQUEST });

    return getClient(getState).settings.resetPassword(
      input.includes('@') ? input : undefined,
      input.includes('@') ? undefined : input,
    ).then(() => {
      dispatch<SecurityAction>({ type: RESET_PASSWORD_SUCCESS });
    }).catch(error => {
      dispatch<SecurityAction>({ type: RESET_PASSWORD_FAIL, error });
      throw error;
    });
  };

const changeEmail = (email: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<SecurityAction>({ type: CHANGE_EMAIL_REQUEST, email });

    return getClient(getState).settings.changeEmail(email, password).then(response => {
      dispatch<SecurityAction>({ type: CHANGE_EMAIL_SUCCESS, email, response });
    }).catch(error => {
      dispatch<SecurityAction>({ type: CHANGE_EMAIL_FAIL, email, error, skipAlert: true });
      throw error;
    });
  };

const deleteAccount = (password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<SecurityAction>({ type: CHANGE_PASSWORD_REQUEST });
    const account = getLoggedInAccount(getState())!;

    dispatch<SecurityAction>({ type: DELETE_ACCOUNT_REQUEST });
    return getClient(getState).settings.deleteAccount(password).then(response => {
      dispatch<SecurityAction>({ type: DELETE_ACCOUNT_SUCCESS, response });
      dispatch<SecurityAction>({ type: AUTH_LOGGED_OUT, account });
      toast.success(messages.loggedOut);
    }).catch(error => {
      dispatch<SecurityAction>({ type: DELETE_ACCOUNT_FAIL, error, skipAlert: true });
      throw error;
    });
  };

const moveAccount = (targetAccount: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<SecurityAction>({ type: MOVE_ACCOUNT_REQUEST });
    return getClient(getState).settings.moveAccount(targetAccount, password).then(response => {
      dispatch<SecurityAction>({ type: MOVE_ACCOUNT_SUCCESS, response });
    }).catch(error => {
      dispatch<SecurityAction>({ type: MOVE_ACCOUNT_FAIL, error, skipAlert: true });
      throw error;
    });
  };

type SecurityAction =
  | { type: typeof FETCH_TOKENS_REQUEST }
  | { type: typeof FETCH_TOKENS_SUCCESS; tokens: Array<OauthToken> }
  | { type: typeof FETCH_TOKENS_FAIL }
  | { type: typeof REVOKE_TOKEN_REQUEST; tokenId: number }
  | { type: typeof REVOKE_TOKEN_SUCCESS; tokenId: number }
  | { type: typeof REVOKE_TOKEN_FAIL; tokenId: number }
  | { type: typeof CHANGE_PASSWORD_REQUEST }
  | { type: typeof CHANGE_PASSWORD_SUCCESS; response: {} }
  | { type: typeof CHANGE_PASSWORD_FAIL; error: unknown; skipAlert: true }
  | { type: typeof RESET_PASSWORD_REQUEST }
  | { type: typeof RESET_PASSWORD_SUCCESS }
  | { type: typeof RESET_PASSWORD_FAIL; error: unknown }
  | { type: typeof CHANGE_EMAIL_REQUEST; email: string }
  | { type: typeof CHANGE_EMAIL_SUCCESS; email: string; response: {} }
  | { type: typeof CHANGE_EMAIL_FAIL; email: string; error: unknown; skipAlert: true }
  | { type: typeof CHANGE_PASSWORD_REQUEST }
  | { type: typeof DELETE_ACCOUNT_REQUEST }
  | { type: typeof DELETE_ACCOUNT_SUCCESS; response: {} }
  | { type: typeof AUTH_LOGGED_OUT; account: Account }
  | { type: typeof DELETE_ACCOUNT_FAIL; error: unknown; skipAlert: true }
  | { type: typeof MOVE_ACCOUNT_REQUEST }
  | { type: typeof MOVE_ACCOUNT_SUCCESS; response: {} }
  | { type: typeof MOVE_ACCOUNT_FAIL; error: unknown; skipAlert: true }

export {
  FETCH_TOKENS_REQUEST,
  FETCH_TOKENS_SUCCESS,
  FETCH_TOKENS_FAIL,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS,
  REVOKE_TOKEN_FAIL,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  RESET_PASSWORD_CONFIRM_REQUEST,
  RESET_PASSWORD_CONFIRM_SUCCESS,
  RESET_PASSWORD_CONFIRM_FAIL,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL,
  CHANGE_EMAIL_REQUEST,
  CHANGE_EMAIL_SUCCESS,
  CHANGE_EMAIL_FAIL,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAIL,
  MOVE_ACCOUNT_REQUEST,
  MOVE_ACCOUNT_SUCCESS,
  MOVE_ACCOUNT_FAIL,
  fetchOAuthTokens,
  revokeOAuthTokenById,
  changePassword,
  resetPassword,
  changeEmail,
  deleteAccount,
  moveAccount,
  type SecurityAction,
};
