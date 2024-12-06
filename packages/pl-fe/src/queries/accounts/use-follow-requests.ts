import { useMutation, type InfiniteData } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';
import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';

import type { PaginatedResponse, PlApiClient } from 'pl-api';

const appendFollowRequest = (accountId: string) =>
  queryClient.setQueryData<InfiniteData<ReturnType<typeof minifyAccountList>>>(['accountsLists', 'followRequests'], (data) => {
    if (!data || data.pages.some(page => page.items.includes(accountId))) return data;

    return {
      ...data,
      pages: data.pages.map((page, index) => index === 0 ? ({ ...page, items: [accountId, ...page.items] }) : page),
    };
  });

const removeFollowRequest = (accountId: string) =>
  queryClient.setQueryData<InfiniteData<ReturnType<typeof minifyAccountList>>>(['accountsLists', 'followRequests'], (data) => data ? {
    ...data,
    pages: data.pages.map(({ items, ...page }) => ({ ...page, items: items.filter((id) => id !== accountId) })),
  } : undefined);

const makeUseFollowRequests = <T>(select: ((data: InfiniteData<PaginatedResponse<string>>) => T)) => makePaginatedResponseQuery(
  () => ['accountsLists', 'followRequests'],
  (client) => client.myAccount.getFollowRequests().then(minifyAccountList),
  select,
);

const useFollowRequests = makeUseFollowRequests((data) => data.pages.map(page => page.items).flat());

const useFollowRequestsCount = makeUseFollowRequests((data) => data.pages.map(page => page.items).flat().length);

const useAcceptFollowRequestMutation = (accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'followRequests', accountId],
    mutationFn: () => client.myAccount.acceptFollowRequest(accountId),
    onSettled: () => removeFollowRequest(accountId),
  });
};

const useRejectFollowRequestMutation = (accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'followRequests', accountId],
    mutationFn: () => client.myAccount.rejectFollowRequest(accountId),
    onSettled: () => removeFollowRequest(accountId),
  });
};

const prefetchFollowRequests = (client: PlApiClient) => queryClient.prefetchInfiniteQuery({
  queryKey: ['accountsLists', 'followRequests'],
  queryFn: ({ pageParam }) => pageParam.next?.() || client.myAccount.getFollowRequests().then(minifyAccountList),
  initialPageParam: { previous: null, next: null, items: [], partial: false } as PaginatedResponse<string>,
});

export {
  appendFollowRequest,
  useFollowRequests,
  useFollowRequestsCount,
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
  prefetchFollowRequests,
};
