/**
 * OAuth: create and revoke tokens.
 * Tokens can be used by users and apps.
 * https://docs.joinmastodon.org/methods/apps/oauth/
 * @module pl-fe/actions/oauth
 * @see module:pl-fe/actions/auth
 */

import { PlApiClient, type GetTokenParams, type RevokeTokenParams } from 'pl-api';

import * as BuildConfig from 'pl-fe/build-config';
import { getBaseURL } from 'pl-fe/utils/state';

import type { AppDispatch, RootState } from 'pl-fe/store';

const obtainOAuthToken = (params: GetTokenParams, baseURL?: string) =>{
  const client = new PlApiClient(baseURL || BuildConfig.BACKEND_URL || '');

  return client.oauth.getToken(params);
};

const revokeOAuthToken = (params: RevokeTokenParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const baseURL = getBaseURL(getState());
    const client = new PlApiClient(baseURL || '');
    return client.oauth.revokeToken(params);
  };

export {
  obtainOAuthToken,
  revokeOAuthToken,
};
