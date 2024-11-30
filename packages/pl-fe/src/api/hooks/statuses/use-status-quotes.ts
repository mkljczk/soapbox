import { useInfiniteQuery } from '@tanstack/react-query';

import { minifyStatusList } from 'pl-fe/api/normalizers/status-list';
import { useClient } from 'pl-fe/hooks/use-client';

import type { PaginatedResponse } from 'pl-api';

const useStatusQuotes = (statusId: string) => {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: ['statusLists', 'quotes', statusId],
    queryFn: ({ pageParam }) => pageParam.next?.() || client.statuses.getStatusQuotes(statusId).then(minifyStatusList),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as PaginatedResponse<string>,
    getNextPageParam: (page) => page.next ? page : undefined,
    select: (data) => data.pages.map(page => page.items).flat(),
  });
};

export { useStatusQuotes };
