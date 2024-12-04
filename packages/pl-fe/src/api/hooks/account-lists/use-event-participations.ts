
import { useInfiniteQuery } from '@tanstack/react-query';

import { minifyAccountList } from 'pl-fe/api/normalizers/minify-list';
import { useClient } from 'pl-fe/hooks/use-client';

import type { PaginatedResponse } from 'pl-api';

const useEventParticipations = (statusId: string) => {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: ['accountsLists', 'eventParticipations', statusId],
    queryFn: ({ pageParam }) => pageParam.next?.() || client.events.getEventParticipations(statusId).then(minifyAccountList),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as PaginatedResponse<string>,
    getNextPageParam: (page) => page.next ? page : undefined,
    select: (data) => data.pages.map(page => page.items).flat(),
  });
};

export { useEventParticipations };
