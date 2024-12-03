import { getAuthUserUrl, getMeUrl } from 'pl-fe/utils/auth';

import type { RootState } from 'pl-fe/store';

/** Figure out the appropriate instance to fetch depending on the state */
const getHost = (state: RootState) => {
  const accountUrl = getMeUrl(state) || getAuthUserUrl(state) as string;

  try {
    return new URL(accountUrl).host;
  } catch {
    return null;
  }
};

export { getHost };
