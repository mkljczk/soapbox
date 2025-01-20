import { infiniteQueryOptions, type InfiniteData } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';
import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';

import { mutationOptions } from '../utils/mutation-options';

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

const followRequestsQueryOptions = makePaginatedResponseQueryOptions(
  ['accountsLists', 'followRequests'],
  (client) => client.myAccount.getFollowRequests().then(minifyAccountList),
)();

const followRequestsCountQueryOptions = infiniteQueryOptions({
  ...followRequestsQueryOptions,
  select: (data) => data.pages.map(page => page.items).flat().length,
});

const acceptFollowRequestMutationOptions = (accountId: string) => mutationOptions({
  mutationKey: ['accountsLists', 'followRequests', accountId],
  mutationFn: () => getClient().myAccount.acceptFollowRequest(accountId),
  onSettled: () => removeFollowRequest(accountId),
});

const rejectFollowRequestMutationOptions = (accountId: string) => mutationOptions({
  mutationKey: ['accountsLists', 'followRequests', accountId],
  mutationFn: () => getClient().myAccount.rejectFollowRequest(accountId),
  onSettled: () => removeFollowRequest(accountId),
});

const prefetchFollowRequests = () => queryClient.prefetchInfiniteQuery(followRequestsQueryOptions);

export {
  appendFollowRequest,
  followRequestsQueryOptions,
  followRequestsCountQueryOptions,
  acceptFollowRequestMutationOptions,
  rejectFollowRequestMutationOptions,
  prefetchFollowRequests,
};
