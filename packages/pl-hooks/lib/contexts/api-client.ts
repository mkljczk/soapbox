import { PlApiClient } from 'pl-api';
import React from 'react';

const PlHooksApiClientContext = React.createContext<{
  client: PlApiClient;
  me: string | null | false;
}>({
  client: new PlApiClient(''),
  me: null,
});

const PlHooksApiClientProvider = PlHooksApiClientContext.Provider;

const usePlHooksApiClient = () => React.useContext(PlHooksApiClientContext);

export { PlHooksApiClientProvider, usePlHooksApiClient };
