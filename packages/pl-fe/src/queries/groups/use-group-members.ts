import { type InfiniteData, useMutation } from '@tanstack/react-query';
import { GroupMember, GroupRole, PaginatedResponse } from 'pl-api';

import { importEntities } from 'pl-fe/actions/importer';
import { useClient } from 'pl-fe/hooks/use-client';
import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { store } from 'pl-fe/store';

import { queryClient } from '../client';
import { minifyList } from '../utils/minify-list';

const removeGroupMember = (groupId: string, accountId: string) =>
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<MinifiedGroupMember>>>(
    { queryKey: ['accountsLists', 'groupMembers', groupId] },
    (data) => data
      ? ({
        ...data,
        pages: data.pages.map((page) => ({ ...page, items: page.items.filter((member) => member.account_id !== accountId) })),
      })
      : undefined,
  );

const minifyGroupMembersList = (response: PaginatedResponse<GroupMember>): PaginatedResponse<Omit<GroupMember, 'account'> & { account_id: string }> =>
  minifyList(response, ({ account, ...groupMember }) => ({ ...groupMember, account_id: account.id }), (groupMembers) => {
    store.dispatch(importEntities({ accounts: groupMembers.map(({ account }) => account) }) as any);
  });

const useGroupMembers = makePaginatedResponseQuery(
  (groupId: string, role?: GroupRole) => ['accountsLists', 'groupMembers', groupId, role],
  (client, [groupId, role]) => client.experimental.groups.getGroupMemberships(groupId, role).then(minifyGroupMembersList),
);

const useKickGroupMemberMutation = (groupId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupMembers', groupId, accountId],
    mutationFn: () => client.experimental.groups.kickGroupUsers(groupId, [accountId]),
    onSuccess: () => removeGroupMember(groupId, accountId),
  });
};

type MinifiedGroupMember = ReturnType<typeof minifyGroupMembersList>['items'][0];

export { useGroupMembers, useKickGroupMemberMutation, type MinifiedGroupMember };
