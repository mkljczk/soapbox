import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';

const useSearchLocation = (query: string) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useQuery({
    queryKey: ['search', 'location', query],
    queryFn: ({ signal }) => client.search.searchLocation(query, { signal }),
    gcTime: 60 * 1000,
    enabled: !!query.trim(),
  }, queryClient);
};

export { useSearchLocation };
