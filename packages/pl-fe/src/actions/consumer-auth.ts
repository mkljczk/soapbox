import { Instance } from 'pl-api';
import queryString from 'query-string';

import * as BuildConfig from 'pl-fe/build-config';
import { queryClient } from 'pl-fe/queries/client';
import { isURL } from 'pl-fe/utils/auth';
import sourceCode from 'pl-fe/utils/code';
import { getInstanceScopes } from 'pl-fe/utils/scopes';

import { createApp } from './apps';

import type { AppDispatch, RootState } from 'pl-fe/store';

const createProviderApp = (instance: Instance) =>
  async(dispatch: AppDispatch, getState: () => RootState) => {
    const scopes = getInstanceScopes(instance);

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

    const instance = queryClient.getQueryData<Instance>(['instance', 'instanceInformation', baseURL])!;
    const scopes = getInstanceScopes(instance);
    const app = await dispatch(createProviderApp(instance));
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
