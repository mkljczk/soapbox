/**
 * State: general Redux state utility functions.
 * @module pl-fe/utils/state
 */

import { getPlFeConfig } from 'pl-fe/actions/pl-fe';
import * as BuildConfig from 'pl-fe/build-config';
import { isPrerendered } from 'pl-fe/precheck';
import { selectOwnAccount } from 'pl-fe/selectors';
import { isURL } from 'pl-fe/utils/auth';

import type { RootState } from 'pl-fe/store';

/** Whether to display the fqn instead of the acct. */
const displayFqn = (state: RootState): boolean => getPlFeConfig(state).displayFqn;

/** Whether the instance exposes instance blocks through the API. */
const federationRestrictionsDisclosed = (state: RootState): boolean =>
  !!state.instance.pleroma.metadata.federation.mrf_policies;

/**
 * Determine whether pl-fe is running in standalone mode.
 * Standalone mode runs separately from any backend and can login anywhere.
 */
const isStandalone = (state: RootState): boolean => {
  const instanceFetchFailed = state.meta.instance_fetch_failed;
  return isURL(BuildConfig.BACKEND_URL) ? false : (!isPrerendered && instanceFetchFailed);
};

const getHost = (url: any): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

/** Get the baseURL of the instance. */
const getBaseURL = (state: RootState): string => {
  const account = selectOwnAccount(state);
  return isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : getHost(account?.url);
};

export {
  displayFqn,
  federationRestrictionsDisclosed,
  isStandalone,
  getBaseURL,
};
