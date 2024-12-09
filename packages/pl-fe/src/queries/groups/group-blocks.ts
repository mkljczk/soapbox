import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';
import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';

import { mutationOptions } from '../utils/mutation-options';

import { removeGroupMember } from './group-members';

import type { InfiniteData } from '@tanstack/react-query';

const appendGroupBlock = (groupId: string, accountId: string) =>
  queryClient.setQueryData<InfiniteData<ReturnType<typeof minifyAccountList>>>(['accountsLists', 'groupBlocks', groupId], (data) => {
    if (!data || data.pages.some(page => page.items.includes(accountId))) return data;

    return {
      ...data,
      pages: data.pages.map((page, index) => index === 0 ? ({ ...page, items: [accountId, ...page.items] }) : page),
    };
  });

const removeGroupBlock = (groupId: string, accountId: string) =>
  queryClient.setQueryData<InfiniteData<ReturnType<typeof minifyAccountList>>>(['accountsLists', 'groupBlocks', groupId], (data) => data ? {
    ...data,
    pages: data.pages.map(({ items, ...page }) => ({ ...page, items: items.filter((id) => id !== accountId) })),
  } : undefined);

const groupBlocksQueryOptions = makePaginatedResponseQueryOptions(
  (groupId: string) => ['accountsLists', 'groupBlocks', groupId],
  (client, [groupId]) => client.experimental.groups.getGroupBlocks(groupId).then(minifyAccountList),
);

const blockGroupUserMutationOptions = (groupId: string, accountId: string) => mutationOptions({
  mutationKey: ['accountsLists', 'groupBlocks', groupId, accountId],
  mutationFn: () => getClient().experimental.groups.blockGroupUsers(groupId, [accountId]),
  onSettled: () => {
    removeGroupMember(groupId, accountId);
    appendGroupBlock(groupId, accountId);
  },
});

const unblockGroupUserMutationOptions = (groupId: string, accountId: string) => mutationOptions({
  mutationKey: ['accountsLists', 'groupBlocks', groupId, accountId],
  mutationFn: () => getClient().experimental.groups.unblockGroupUsers(groupId, [accountId]),
  onSettled: () => removeGroupBlock(groupId, accountId),
});

export {
  groupBlocksQueryOptions,
  blockGroupUserMutationOptions,
  unblockGroupUserMutationOptions,
};
