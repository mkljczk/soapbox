import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

const accountScrobbleQueryOptions = (accountId?: string) => queryOptions({
  queryKey: ['scrobbles', accountId!],
  queryFn: async () => (await getClient().accounts.getScrobbles(accountId!, { limit: 1 })).items[0] || null,
  placeholderData: undefined,
  // enabled: enabled && !!accountId && features.scrobbles,
  staleTime: 3 * 60 * 1000,
});

export { accountScrobbleQueryOptions };
