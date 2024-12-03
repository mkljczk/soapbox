import mapValues from 'lodash/mapValues';

import { verifyCredentials } from './auth';
import { importEntities } from './importer';

import type { AppDispatch } from 'pl-fe/store';

const PLEROMA_PRELOAD_IMPORT = 'PLEROMA_PRELOAD_IMPORT' as const;
const MASTODON_PRELOAD_IMPORT = 'MASTODON_PRELOAD_IMPORT' as const;

// https://git.pleroma.social/pleroma/pleroma-fe/-/merge_requests/1176/diffs
const decodeUTF8Base64 = (data: string) => {
  const rawData = atob(data);
  const array = Uint8Array.from(rawData.split('').map((char) => char.charCodeAt(0)));
  const text = new TextDecoder().decode(array);
  return text;
};

const decodePleromaData = (data: Record<string, any>) =>
  mapValues(data, base64string => JSON.parse(decodeUTF8Base64(base64string)));

const pleromaDecoder = (json: string) => decodePleromaData(JSON.parse(json));

// This will throw if it fails.
// Should be called inside a try-catch.
const decodeFromMarkup = (elementId: string, decoder: (json: string) => Record<string, any>) => {
  const { textContent } = document.getElementById(elementId)!;
  return decoder(textContent as string);
};

const preloadFromMarkup = (elementId: string, decoder: (json: string) => Record<string, any>, action: (data: Record<string, any>) => any) =>
  (dispatch: AppDispatch) => {
    try {
      const data = decodeFromMarkup(elementId, decoder);
      dispatch(action(data));
    } catch {
      // Do nothing
    }
  };

const preload = () =>
  (dispatch: AppDispatch) => {
    dispatch(preloadFromMarkup('initial-results', pleromaDecoder, preloadPleroma));
    dispatch(preloadFromMarkup('initial-state', JSON.parse, preloadMastodon));
  };

const preloadPleroma = (data: Record<string, any>) => ({
  type: PLEROMA_PRELOAD_IMPORT,
  data,
});

const preloadMastodon = (data: Record<string, any>) =>
  (dispatch: AppDispatch) => {
    const { me, access_token } = data.meta;
    const { url } = data.accounts[me];

    dispatch(importEntities({ accounts: Object.values(data.accounts) }));
    dispatch(verifyCredentials(access_token, url));
    dispatch({ type: MASTODON_PRELOAD_IMPORT, data });
  };

interface PreloadAction {
  type: typeof PLEROMA_PRELOAD_IMPORT | typeof MASTODON_PRELOAD_IMPORT;
  data: Record<string, any>;
}

export {
  PLEROMA_PRELOAD_IMPORT,
  MASTODON_PRELOAD_IMPORT,
  decodeFromMarkup,
  pleromaDecoder,
  preload,
  preloadMastodon,
  type PreloadAction,
};
