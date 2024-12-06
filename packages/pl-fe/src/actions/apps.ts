/**
 * Apps: manage OAuth applications.
 * Particularly useful for auth.
 * https://docs.joinmastodon.org/methods/apps/
 * @module pl-fe/actions/apps
 * @see module:pl-fe/actions/auth
 */

import { PlApiClient, type CreateApplicationParams } from 'pl-api';

import * as BuildConfig from 'pl-fe/build-config';

const createApp = (params: CreateApplicationParams, baseURL?: string) => {
  const client = new PlApiClient(baseURL || BuildConfig.BACKEND_URL || '');

  return client.apps.createApplication(params);
};

export {
  createApp,
};
