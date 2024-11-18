import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchGroupBlocks, groupUnblock } from 'pl-fe/actions/groups';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import Account from 'pl-fe/components/account';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Spinner from 'pl-fe/components/ui/spinner';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import toast from 'pl-fe/toast';

import ColumnForbidden from '../ui/components/column-forbidden';

type RouteParams = { groupId: string };

const messages = defineMessages({
  heading: { id: 'column.group_blocked_members', defaultMessage: 'Banned members' },
  unblock: { id: 'group.group_mod_unblock', defaultMessage: 'Unban' },
  unblocked: { id: 'group.group_mod_unblock.success', defaultMessage: 'Unbanned @{name} from group' },
});

interface IBlockedMember {
  accountId: string;
  groupId: string;
}

const BlockedMember: React.FC<IBlockedMember> = ({ accountId, groupId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useAccount(accountId);

  if (!account) return null;

  const handleUnblock = () =>
    dispatch(groupUnblock(groupId, accountId))
      .then(() => toast.success(intl.formatMessage(messages.unblocked, { name: account.acct })));

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>

      <Button
        theme='secondary'
        text={intl.formatMessage(messages.unblock)}
        onClick={handleUnblock}
      />
    </HStack>
  );
};

interface IGroupBlockedMembers {
  params: RouteParams;
}

const GroupBlockedMembers: React.FC<IGroupBlockedMembers> = ({ params }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const groupId = params?.groupId;

  const { group } = useGroup(groupId);
  const accountIds = useAppSelector((state) => state.user_lists.group_blocks[groupId]?.items);

  useEffect(() => {
    dispatch(fetchGroupBlocks(groupId));
  }, [groupId]);

  if (!group || !group.relationship || !accountIds) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['owner', 'admin', 'moderator'].includes(group.relationship.role)) {
    return (<ColumnForbidden />);
  }

  const emptyMessage = <FormattedMessage id='empty_column.group_blocks' defaultMessage="The group hasn't banned any users yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref={`/groups/${group.id}/manage`}>
      <ScrollableList emptyMessage={emptyMessage} emptyMessageCard={false}>
        {accountIds.map((accountId) =>
          <BlockedMember key={accountId} accountId={accountId} groupId={groupId} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export { GroupBlockedMembers as default };
