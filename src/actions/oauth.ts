/**
 * OAuth: create and revoke tokens.
 * Tokens can be used by users and apps.
 * https://docs.joinmastodon.org/methods/apps/oauth/
 * @module soapbox/actions/oauth
 * @see module:soapbox/actions/auth
 */

import { PlApiClient } from 'pl-api';

import * as BuildConfig from 'soapbox/build-config';
import { getBaseURL } from 'soapbox/utils/state';

import type { AppDispatch, RootState } from 'soapbox/store';

const OAUTH_TOKEN_CREATE_REQUEST = 'OAUTH_TOKEN_CREATE_REQUEST';
const OAUTH_TOKEN_CREATE_SUCCESS = 'OAUTH_TOKEN_CREATE_SUCCESS';
const OAUTH_TOKEN_CREATE_FAIL    = 'OAUTH_TOKEN_CREATE_FAIL';

const OAUTH_TOKEN_REVOKE_REQUEST = 'OAUTH_TOKEN_REVOKE_REQUEST';
const OAUTH_TOKEN_REVOKE_SUCCESS = 'OAUTH_TOKEN_REVOKE_SUCCESS';
const OAUTH_TOKEN_REVOKE_FAIL    = 'OAUTH_TOKEN_REVOKE_FAIL';

const obtainOAuthToken = (params: Record<string, string | undefined>, baseURL?: string) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: OAUTH_TOKEN_CREATE_REQUEST, params });
    const client = new PlApiClient(baseURL || BuildConfig.BACKEND_URL || '', undefined, { fetchInstance: false });

    return client.oauth.getToken(params).then((token) => {
      dispatch({ type: OAUTH_TOKEN_CREATE_SUCCESS, params, token });
      return token;
    }).catch(error => {
      dispatch({ type: OAUTH_TOKEN_CREATE_FAIL, params, error, skipAlert: true });
      throw error;
    });
  };

const revokeOAuthToken = (params: Record<string, string>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: OAUTH_TOKEN_REVOKE_REQUEST, params });
    const baseURL = getBaseURL(getState());
    const client = new PlApiClient(baseURL || '', undefined, { fetchInstance: false });
    return client.oauth.revokeToken(params).then((data) => {
      dispatch({ type: OAUTH_TOKEN_REVOKE_SUCCESS, params, data });
      return data;
    }).catch(error => {
      dispatch({ type: OAUTH_TOKEN_REVOKE_FAIL, params, error });
      throw error;
    });
  };

export {
  OAUTH_TOKEN_CREATE_REQUEST,
  OAUTH_TOKEN_CREATE_SUCCESS,
  OAUTH_TOKEN_CREATE_FAIL,
  OAUTH_TOKEN_REVOKE_REQUEST,
  OAUTH_TOKEN_REVOKE_SUCCESS,
  OAUTH_TOKEN_REVOKE_FAIL,
  obtainOAuthToken,
  revokeOAuthToken,
};
