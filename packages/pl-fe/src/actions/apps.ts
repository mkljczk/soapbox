/**
 * Apps: manage OAuth applications.
 * Particularly useful for auth.
 * https://docs.joinmastodon.org/methods/apps/
 * @module pl-fe/actions/apps
 * @see module:pl-fe/actions/auth
 */

import { PlApiClient, type CreateApplicationParams } from 'pl-api';

import * as BuildConfig from 'pl-fe/build-config';

import type { AppDispatch } from 'pl-fe/store';

const APP_CREATE_REQUEST = 'APP_CREATE_REQUEST' as const;
const APP_CREATE_SUCCESS = 'APP_CREATE_SUCCESS' as const;
const APP_CREATE_FAIL = 'APP_CREATE_FAIL' as const;

const createApp = (params: CreateApplicationParams, baseURL?: string) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: APP_CREATE_REQUEST, params });

    const client = new PlApiClient(baseURL || BuildConfig.BACKEND_URL || '');

    return client.apps.createApplication(params).then((app) => {
      dispatch({ type: APP_CREATE_SUCCESS, params, app });
      return app;
    }).catch(error => {
      dispatch({ type: APP_CREATE_FAIL, params, error });
      throw error;
    });
  };

export {
  APP_CREATE_REQUEST,
  APP_CREATE_SUCCESS,
  APP_CREATE_FAIL,
  createApp,
};
