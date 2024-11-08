import { useInfiniteQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { minifyStatusList } from 'pl-hooks/normalizers/status-list';

import type { PaginatedResponse } from 'pl-api';

const useStatusQuotes = (statusId: string) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  const statusQuotesQuery = useInfiniteQuery({
    queryKey: ['statusesLists', 'quotes', statusId],
    queryFn: ({ pageParam }) => pageParam.next?.() || client.statuses.getStatusQuotes(statusId).then(minifyStatusList),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as PaginatedResponse<string>,
    getNextPageParam: (page) => page.next ? page : undefined,
  }, queryClient);

  const data = statusQuotesQuery.data?.pages.map(page => page.items).flat();

  return { ...statusQuotesQuery, data };
};

export { useStatusQuotes };
