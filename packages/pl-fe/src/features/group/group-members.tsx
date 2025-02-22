import clsx from 'clsx';
import { GroupRoles } from 'pl-api';
import React, { useMemo } from 'react';

import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import { useGroupMembershipRequests } from 'pl-fe/api/hooks/groups/use-group-membership-requests';
import { PendingItemsRow } from 'pl-fe/components/pending-items-row';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { useGroupMembers } from 'pl-fe/queries/groups/use-group-members';

import PlaceholderAccount from '../placeholder/components/placeholder-account';

import GroupMemberListItem from './components/group-member-list-item';

interface IGroupMembers {
  params: { groupId: string };
}

const GroupMembers: React.FC<IGroupMembers> = (props) => {
  const { groupId } = props.params;

  const { group, isFetching: isFetchingGroup } = useGroup(groupId);
  const { data: owners, isFetching: isFetchingOwners } = useGroupMembers(groupId, GroupRoles.OWNER);
  const { data: admins, isFetching: isFetchingAdmins } = useGroupMembers(groupId, GroupRoles.ADMIN);
  const { data: users, isFetching: isFetchingUsers, fetchNextPage, hasNextPage } = useGroupMembers(groupId, GroupRoles.USER);
  const { isFetching: isFetchingPending, count: pendingCount } = useGroupMembershipRequests(groupId);

  const isLoading = isFetchingGroup || isFetchingOwners || isFetchingAdmins || isFetchingUsers || isFetchingPending;

  const members = useMemo(() => [
    ...(owners || []),
    ...(admins || []),
    ...(users || []),
  ], [owners, admins, users]);

  return (
    <>
      <ScrollableList
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isLoading={!group || isLoading}
        showLoading={!group || isFetchingPending || isLoading && members.length === 0}
        placeholderComponent={PlaceholderAccount}
        placeholderCount={3}
        className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
        itemClassName='py-3 last:pb-0'
        prepend={(pendingCount > 0) && (
          <div className={clsx('py-3', { 'border-b border-gray-200 dark:border-gray-800': members.length })}>
            <PendingItemsRow
              to={`/groups/${group?.id}/manage/requests`}
              count={pendingCount}
            />
          </div>
        )}
      >
        {members.map((member) => (
          <GroupMemberListItem
            group={group!}
            member={member}
            key={member.account_id}
          />
        ))}
      </ScrollableList>
    </>
  );
};

export { GroupMembers as default };
