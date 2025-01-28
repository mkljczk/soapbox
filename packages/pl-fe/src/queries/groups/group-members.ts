import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { store } from 'pl-fe/store';

import { queryClient } from '../client';
import { minifyList } from '../utils/minify-list';
import { mutationOptions } from '../utils/mutation-options';

import type { InfiniteData } from '@tanstack/react-query';
import type { GroupMember, GroupRole, PaginatedResponse } from 'pl-api';

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

const groupMembersOptions = makePaginatedResponseQueryOptions(
  (groupId: string, role?: GroupRole) => ['accountsLists', 'groupMembers', groupId, role],
  (client, [groupId, role]) => client.experimental.groups.getGroupMemberships(groupId, role).then(minifyGroupMembersList),
);

const kickGroupMemberMutationOptions = (groupId: string, accountId: string) => mutationOptions({
  mutationKey: ['accountsLists', 'groupMembers', groupId, accountId],
  mutationFn: () => getClient().experimental.groups.kickGroupUsers(groupId, [accountId]),
  onSuccess: () => removeGroupMember(groupId, accountId),
});

type MinifiedGroupMember = ReturnType<typeof minifyGroupMembersList>['items'][0];

export { groupMembersOptions, kickGroupMemberMutationOptions, removeGroupMember, type MinifiedGroupMember };
