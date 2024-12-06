import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';

import { StatProvider } from 'pl-fe/contexts/stat-context';
import { createGlobals } from 'pl-fe/globals';
import { queryClient } from 'pl-fe/queries/client';

import { checkOnboardingStatus } from '../actions/onboarding';
import { preload } from '../actions/preload';
import { store } from '../store';

import PlFeHead from './pl-fe-head';
import PlFeLoad from './pl-fe-load';
import PlFeMount from './pl-fe-mount';

// Configure global functions for developers
createGlobals(store);

// Preload happens synchronously
store.dispatch(preload() as any);

// This happens synchronously
store.dispatch(checkOnboardingStatus() as any);

/** The root React node of the application. */
const PlFe: React.FC = () => (
  <>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StatProvider>
          <HelmetProvider>
            <PlFeHead />
            <PlFeLoad>
              <PlFeMount />
            </PlFeLoad>
          </HelmetProvider>
        </StatProvider>
      </QueryClientProvider>
    </Provider>
  </>
);

export { PlFe as default };
