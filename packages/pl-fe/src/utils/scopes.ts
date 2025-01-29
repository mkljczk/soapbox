import { getFeatures, PLEROMA, TOKI, type Instance } from 'pl-api';

import type { RootState } from 'pl-fe/store';

/**
 * Get the OAuth scopes to use for login & signup.
 * Mastodon will refuse scopes it doesn't know, so care is needed.
 */
const getInstanceScopes = (instance: Instance, admin: boolean =  true) => {
  const v = getFeatures(instance).version;

  let scopes;

  switch (v.software) {
    case TOKI:
      scopes = 'read write follow push write:bites';
      break;
    case PLEROMA:
      scopes = 'read write follow push admin';
      break;
    default:
      scopes = 'read write follow push';
  }

  if (admin) {
    switch (v.software) {
      case PLEROMA:
        scopes += ' admin';
        break;
      default:
        scopes += ' admin:read admin:write';
    }
  }

  return scopes;
};

/** Convenience function to get scopes from instance in store. */
const getScopes = (state: RootState) => getInstanceScopes(state.instance);

export {
  getInstanceScopes,
  getScopes,
};
