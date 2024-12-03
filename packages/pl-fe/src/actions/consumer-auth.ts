import queryString from 'query-string';

import * as BuildConfig from 'pl-fe/build-config';
import { isURL } from 'pl-fe/utils/auth';
import sourceCode from 'pl-fe/utils/code';
import { getScopes } from 'pl-fe/utils/scopes';

import { createApp } from './apps';

import type { AppDispatch, RootState } from 'pl-fe/store';

const createProviderApp = () =>
  async(dispatch: AppDispatch, getState: () => RootState) => {
    const scopes = getScopes(getState());

    const params = {
      client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
      redirect_uris: `${window.location.origin}/login/external`,
      website: sourceCode.homepage,
      scopes,
    };

    return dispatch(createApp(params));
  };

const prepareRequest = (provider: string) =>
  async(dispatch: AppDispatch, getState: () => RootState) => {
    const baseURL = isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : '';

    const scopes = getScopes(getState());
    const app = await dispatch(createProviderApp());
    const { client_id, redirect_uri } = app;

    localStorage.setItem('plfe:external:app', JSON.stringify(app));
    localStorage.setItem('plfe:external:baseurl', baseURL);
    localStorage.setItem('plfe:external:scopes', scopes);

    const params = {
      provider,
      'authorization[client_id]': client_id,
      'authorization[redirect_uri]': redirect_uri,
      'authorization[scope]': scopes,
    };

    const query = queryString.stringify(params);

    location.href = `${baseURL}/oauth/prepare_request?${query.toString()}`;
  };

export {
  prepareRequest,
};
