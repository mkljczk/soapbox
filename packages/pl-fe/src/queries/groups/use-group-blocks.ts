import { useMutation, type InfiniteData } from '@tanstack/react-query';

import { makePaginatedResponseQuery } from 'pl-fe/api/utils/make-paginated-response-query';
import { minifyAccountList } from 'pl-fe/api/utils/minify-list';
import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';

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

const useGroupBlocks = makePaginatedResponseQuery(
  (groupId: string) => ['accountsLists', 'groupBlocks', groupId],
  (client, [groupId]) => client.experimental.groups.getGroupBlocks(groupId).then(minifyAccountList),
);

const useBlockGroupUserMutation = (groupId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupBlocks', groupId, accountId],
    mutationFn: () => client.experimental.groups.blockGroupUsers(groupId, [accountId]),
    onSettled: () => appendGroupBlock(groupId, accountId),
  });
};

const useUnblockGroupUserMutation = (groupId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupBlocks', groupId, accountId],
    mutationFn: () => client.experimental.groups.unblockGroupUsers(groupId, [accountId]),
    onSettled: () => removeGroupBlock(groupId, accountId),
  });
};

export {
  useGroupBlocks,
  useBlockGroupUserMutation,
  useUnblockGroupUserMutation,
};
