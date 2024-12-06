/**
 * API: HTTP client and utilities.
 * @module pl-fe/api
 */
import * as BuildConfig from 'pl-fe/build-config';
import { RootState } from 'pl-fe/store';
import { buildFullPath } from 'pl-fe/utils/url';

type PlfeResponse<T = any> = Response & { data: string; json: T };

/**
  * Dumb client for grabbing static files.
  * It uses FE_SUBDIRECTORY and parses JSON if possible.
  * No authorization is needed.
  */
const staticFetch = (input: URL | RequestInfo, init?: RequestInit | undefined) => {
  const fullPath = buildFullPath(input.toString(), BuildConfig.BACKEND_URL);

  return fetch(fullPath, init).then(async (response) => {
    if (!response.ok) throw { response };
    const data = await response.text();
    let json: any = undefined!;
    try {
      json = JSON.parse(data);
    } catch (e) {
      //
    }

    const { headers, ok, redirected, status, statusText, type, url } = response;

    return { headers, ok, redirected, status, statusText, type, url, data, json } as any as PlfeResponse;
  });
};

const getClient = (state: RootState | (() => RootState)) => {
  if (typeof state === 'function') state = state();

  return state.auth.client;
};

export {
  type PlfeResponse,
  staticFetch,
  getClient,
};
