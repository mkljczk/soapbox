import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

const searchLocationQueryOptions = (query: string) => queryOptions({
  queryKey: ['search', 'location', query],
  queryFn: ({ signal }) => getClient().search.searchLocation(query, { signal }),
  gcTime: 60 * 1000,
  enabled: !!query.trim(),
});

export { searchLocationQueryOptions };
