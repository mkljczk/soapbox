/**
 * Build config: configuration set at build time.
 * @module pl-fe/build-config
 */

// eslint-disable-next-line import/extensions
import trim from 'lodash/trim.js';
// eslint-disable-next-line import/extensions
import trimEnd from 'lodash/trimEnd.js';

const {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
} = process.env;

const sanitizeURL = (url: string | undefined = ''): string => {
  try {
    return trimEnd(new URL(url).toString(), '/');
  } catch {
    return '';
  }
};

const sanitizeBasename = (path: string | undefined = ''): string => `/${trim(path, '/')}`;

const env = {
  NODE_ENV: NODE_ENV || 'development',
  BACKEND_URL: sanitizeURL(BACKEND_URL),
  FE_SUBDIRECTORY: sanitizeBasename(FE_SUBDIRECTORY),
};

export type PlFeEnv = typeof env;

export default () => ({
  data: env,
});
