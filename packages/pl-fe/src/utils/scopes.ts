import { getFeatures, PLEROMA, TOKI, type Instance } from 'pl-api';

import * as BuildConfig from 'pl-fe/build-config';
import { queryClient } from 'pl-fe/queries/client';

/**
 * Get the OAuth scopes to use for login & signup.
 * Mastodon will refuse scopes it doesn't know, so care is needed.
 */
const getInstanceScopes = (instance?: Instance) => {
  const software = instance ? getFeatures(instance).version.software : null;

  switch (software) {
    case TOKI:
      return 'read write follow push write:bites';
    case PLEROMA:
      return 'read write follow push admin';
    default:
      return 'read write follow push';
  }
};

/** Convenience function to get scopes from instance in store. */
const getScopes = (baseURL = BuildConfig.BACKEND_URL || '') => {
  const instance = queryClient.getQueryData<Instance>(['instance', 'instanceInformation', baseURL]);

  return getInstanceScopes(instance);
};

export {
  getInstanceScopes,
  getScopes,
};
