import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

const useSearchLocation = (query: string) => {
  const client = useClient();

  return useQuery({
    queryKey: ['search', 'location', query],
    queryFn: ({ signal }) => client.search.searchLocation(query, { signal }),
    gcTime: 60 * 1000,
    enabled: !!query.trim(),
  });
};

export { useSearchLocation };
