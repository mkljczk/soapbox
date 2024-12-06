import { NODE_ENV } from 'pl-fe/build-config';
import sourceCode from 'pl-fe/utils/code';

import type { CaptureContext, UserFeedback } from '@sentry/types';
import type { Account } from 'pl-api';
import type { SetOptional } from 'type-fest';

/** Start Sentry. */
const startSentry = async (dsn: string): Promise<void> => {
  const Sentry = await import('@sentry/react');

  Sentry.init({
    dsn,
    debug: false,
    enabled: NODE_ENV === 'production',
    integrations: [Sentry.browserTracingIntegration()],

    // Filter events.
    // https://docs.sentry.io/platforms/javascript/configuration/filtering/
    ignoreErrors: [
      // Network errors.
      'AxiosError',
      // sw.js couldn't be downloaded.
      'Failed to update a ServiceWorker for scope',
      // Useful for try/catch, useless as a Sentry error.
      'AbortError',
      // localForage error in FireFox private browsing mode (which doesn't support IndexedDB).
      // We only use IndexedDB as a cache, so we can safely ignore the error.
      'No available storage method found',
    ],
    denyUrls: [
      // Browser extensions.
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],

    tracesSampleRate: .1,
  });

  Sentry.setContext('pl-fe', sourceCode);
};

/** Associate the account with Sentry events. */
const setSentryAccount = async (account: Pick<Account, 'id' | 'acct' | 'url'>): Promise<void> => {
  const Sentry = await import('@sentry/react');

  Sentry.setUser({
    id: account.id,
    username: account.acct,
    url: account.url,
  });
};

/** Remove the account from Sentry events. */
const unsetSentryAccount = async (): Promise<void> => {
  const Sentry = await import('@sentry/react');
  Sentry.setUser(null);
};

/** Capture the exception and report it to Sentry. */
const captureSentryException = async (exception: any, captureContext?: CaptureContext | undefined): Promise<string> => {
  const Sentry = await import('@sentry/react');
  return Sentry.captureException(exception, captureContext);
};

/** Capture user feedback and report it to Sentry. */
const captureSentryFeedback = async (feedback: SetOptional<UserFeedback, 'name' | 'email'>): Promise<void> => {
  const Sentry = await import('@sentry/react');
  Sentry.captureUserFeedback(feedback as UserFeedback);
};

export {
  startSentry,
  setSentryAccount,
  unsetSentryAccount,
  captureSentryException,
  captureSentryFeedback,
};
