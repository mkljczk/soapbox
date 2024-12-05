import { GroupMember, GroupRole, PaginatedResponse } from 'pl-api';

import { importEntities } from 'pl-fe/actions/importer';
import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { store } from 'pl-fe/store';

import { minifyList } from '../utils/minify-list';

const minifyGroupMembersList = (response: PaginatedResponse<GroupMember>): PaginatedResponse<Omit<GroupMember, 'account'> & { account_id: string }> =>
  minifyList(response, ({ account, ...groupMember }) => ({ ...groupMember, account_id: account.id }), (groupMembers) => {
    store.dispatch(importEntities({ accounts: groupMembers.map(({ account }) => account) }) as any);
  });

const useGroupMembers = makePaginatedResponseQuery(
  (groupId: string, role?: GroupRole) => ['accountsLists', 'groupMembers', groupId, role],
  (client, [groupId, role]) => client.experimental.groups.getGroupMemberships(groupId, role).then(minifyGroupMembersList),
);

type MinifiedGroupMember = ReturnType<typeof minifyGroupMembersList>['items'][0];

export { useGroupMembers, type MinifiedGroupMember };
