/**
 * External Auth: workflow for logging in to remote servers.
 * @module pl-fe/actions/external_auth
 * @see module:pl-fe/actions/auth
 * @see module:pl-fe/actions/apps
 * @see module:pl-fe/actions/oauth
 */

import { instanceSchema, PlApiClient, type Instance } from 'pl-api';
import * as v from 'valibot';

import { createApp } from 'pl-fe/actions/apps';
import { authLoggedIn, verifyCredentials, switchAccount } from 'pl-fe/actions/auth';
import { obtainOAuthToken } from 'pl-fe/actions/oauth';
import { parseBaseURL } from 'pl-fe/utils/auth';
import sourceCode from 'pl-fe/utils/code';
import { getInstanceScopes } from 'pl-fe/utils/scopes';

import type { AppDispatch } from 'pl-fe/store';

const fetchExternalInstance = (baseURL: string) =>
  (new PlApiClient(baseURL)).instance.getInstance()
    .then(instance => instance)
    .catch(error => {
      if (error.response?.status === 401) {
        // Authenticated fetch is enabled.
        // Continue with a limited featureset.
        return v.parse(instanceSchema, {});
      } else {
        throw error;
      }
    });

const createExternalApp = (instance: Instance, baseURL?: string) => {
  const params = {
    client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
    redirect_uris: `${window.location.origin}/login/external`,
    website: sourceCode.homepage,
    scopes: getInstanceScopes(instance),
  };

  return createApp(params, baseURL);
};

const externalAuthorize = (instance: Instance, baseURL: string) =>
  (dispatch: AppDispatch) => {
    const scopes = getInstanceScopes(instance);

    return createExternalApp(instance, baseURL).then((app) => {
      const { client_id, redirect_uri } = app;

      const query = new URLSearchParams({
        client_id,
        redirect_uri: redirect_uri || app.redirect_uris[0]!,
        response_type: 'code',
        scope: scopes,
      });

      localStorage.setItem('plfe:external:app', JSON.stringify(app));
      localStorage.setItem('plfe:external:baseurl', baseURL);
      localStorage.setItem('plfe:external:scopes', scopes);

      window.location.href = `${baseURL}/oauth/authorize?${query.toString()}`;
    });
  };

const externalLogin = (host: string) =>
  (dispatch: AppDispatch) => {
    const baseURL = parseBaseURL(host) || parseBaseURL(`https://${host}`);

    return fetchExternalInstance(baseURL).then((instance) => {
      dispatch(externalAuthorize(instance, baseURL));
    });
  };

const loginWithCode = (code: string) =>
  (dispatch: AppDispatch) => {
    const { client_id, client_secret, redirect_uri } = JSON.parse(localStorage.getItem('plfe:external:app')!);
    const baseURL = localStorage.getItem('plfe:external:baseurl')!;
    const scope = localStorage.getItem('plfe:external:scopes')!;

    const params = {
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code',
      scope,
      code,
    };

    return obtainOAuthToken(params, baseURL)
      .then((token) => dispatch(authLoggedIn(token)))
      .then(({ access_token }) => dispatch(verifyCredentials(access_token, baseURL)))
      .then((account) => dispatch(switchAccount(account.id)))
      .then(() => window.location.href = '/');
  };

export {
  externalLogin,
  loginWithCode,
};
