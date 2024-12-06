import { QueryClient } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: Infinity,
      retry: false,
    },
  },
});

const PlHooksQueryClientContext = React.createContext<QueryClient>(queryClient);

const PlHooksQueryClientProvider = PlHooksQueryClientContext.Provider;

const usePlHooksQueryClient = () => React.useContext(PlHooksQueryClientContext);

export { queryClient, PlHooksQueryClientProvider, usePlHooksQueryClient };
