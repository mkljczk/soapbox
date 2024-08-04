/**
 * Apps: manage OAuth applications.
 * Particularly useful for auth.
 * https://docs.joinmastodon.org/methods/apps/
 * @module soapbox/actions/apps
 * @see module:soapbox/actions/auth
 */

import { PlApiClient } from 'pl-api';

import * as BuildConfig from 'soapbox/build-config';

import type { AnyAction } from 'redux';

const APP_CREATE_REQUEST = 'APP_CREATE_REQUEST';
const APP_CREATE_SUCCESS = 'APP_CREATE_SUCCESS';
const APP_CREATE_FAIL    = 'APP_CREATE_FAIL';

const createApp = (params?: Record<string, string>, baseURL?: string) =>
  (dispatch: React.Dispatch<AnyAction>) => {
    dispatch({ type: APP_CREATE_REQUEST, params });

    const client = new PlApiClient(baseURL || BuildConfig.BACKEND_URL || '', undefined, { fetchInstance: false });
    return client.apps.createApplication(params).then((app) => {
      dispatch({ type: APP_CREATE_SUCCESS, params, app });
      return app as Record<string, string>;
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
