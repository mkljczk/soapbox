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

const FETCH_TOKENS_SUCCESS = 'FETCH_TOKENS_SUCCESS' as const;

const REVOKE_TOKEN_SUCCESS = 'REVOKE_TOKEN_SUCCESS' as const;

const fetchOAuthTokens = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.getOauthTokens().then((tokens) => {
      dispatch<SecurityAction>({ type: FETCH_TOKENS_SUCCESS, tokens });
    });

const revokeOAuthTokenById = (tokenId: number) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.deleteOauthToken(tokenId).then(() => {
      dispatch<SecurityAction>({ type: REVOKE_TOKEN_SUCCESS, tokenId });
    });

const changePassword = (oldPassword: string, newPassword: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.changePassword(oldPassword, newPassword);

const resetPassword = (usernameOrEmail: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const input = normalizeUsername(usernameOrEmail);

    return getClient(getState).settings.resetPassword(
      input.includes('@') ? input : undefined,
      input.includes('@') ? undefined : input,
    );
  };

const changeEmail = (email: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.changeEmail(email, password);

const deleteAccount = (password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const account = getLoggedInAccount(getState())!;

    return getClient(getState).settings.deleteAccount(password).then(() => {
      dispatch<SecurityAction>({ type: AUTH_LOGGED_OUT, account });
      toast.success(messages.loggedOut);
    });
  };

const moveAccount = (targetAccount: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.moveAccount(targetAccount, password);

type SecurityAction =
  | { type: typeof FETCH_TOKENS_SUCCESS; tokens: Array<OauthToken> }
  | { type: typeof REVOKE_TOKEN_SUCCESS; tokenId: number }
  | { type: typeof AUTH_LOGGED_OUT; account: Account }

export {
  FETCH_TOKENS_SUCCESS,
  REVOKE_TOKEN_SUCCESS,
  fetchOAuthTokens,
  revokeOAuthTokenById,
  changePassword,
  resetPassword,
  changeEmail,
  deleteAccount,
  moveAccount,
  type SecurityAction,
};
