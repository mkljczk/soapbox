import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { minifyAccountList } from 'pl-fe/api/normalizers/minify-list';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

import type { PaginatedResponse } from 'pl-api';

const useStatusInteractions = (statusId: string, method: 'getDislikedBy' | 'getFavouritedBy' | 'getRebloggedBy') => {
  const client = useClient();

  const queryKey = {
    getDislikedBy: 'statusDislikes',
    getFavouritedBy: 'statusFavourites',
    getRebloggedBy: 'statusReblogs',
  }[method];

  return useInfiniteQuery({
    queryKey: ['accountsLists', queryKey, statusId],
    queryFn: ({ pageParam }) => pageParam.next?.() || client.statuses[method](statusId).then(minifyAccountList),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as PaginatedResponse<string>,
    getNextPageParam: (page) => page.next ? page : undefined,
    select: (data) => data.pages.map(page => page.items).flat(),
  });
};

const useStatusDislikes = (statusId: string) => useStatusInteractions(statusId, 'getDislikedBy');
const useStatusFavourites = (statusId: string) => useStatusInteractions(statusId, 'getFavouritedBy');
const useStatusReblogs = (statusId: string) => useStatusInteractions(statusId, 'getRebloggedBy');

const useStatusReactions = (statusId: string, emoji?: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['accountsLists', 'statusReactions', statusId, emoji],
    queryFn: () => client.statuses.getStatusReactions(statusId, emoji).then((reactions) => {
      dispatch(importEntities({ accounts: reactions.map(({ accounts }) => accounts).flat() }));

      return reactions.map(({ accounts, ...reactions }) => reactions);
    }),
    placeholderData: (previousData) => previousData?.filter(({ name }) => name === emoji),
  });
};

export { useStatusDislikes, useStatusFavourites, useStatusReactions, useStatusReblogs };
