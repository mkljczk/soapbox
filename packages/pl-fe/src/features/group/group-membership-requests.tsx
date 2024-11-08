import { GroupRoles } from 'pl-api';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import { useGroupMembers } from 'pl-fe/api/hooks/groups/use-group-members';
import { useGroupMembershipRequests } from 'pl-fe/api/hooks/groups/use-group-membership-requests';
import Account from 'pl-fe/components/account';
import { AuthorizeRejectButtons } from 'pl-fe/components/authorize-reject-buttons';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Spinner from 'pl-fe/components/ui/spinner';
import toast from 'pl-fe/toast';

import ColumnForbidden from '../ui/components/column-forbidden';

import type { PlfeResponse } from 'pl-fe/api';
import type { Account as AccountEntity } from 'pl-fe/normalizers/account';

type RouteParams = { groupId: string };

const messages = defineMessages({
  heading: { id: 'column.group_pending_requests', defaultMessage: 'Pending requests' },
  authorizeFail: { id: 'group.group_mod_authorize.fail', defaultMessage: 'Failed to approve @{name}' },
  rejectFail: { id: 'group.group_mod_reject.fail', defaultMessage: 'Failed to reject @{name}' },
});

interface IMembershipRequest {
  account: AccountEntity;
  onAuthorize(account: AccountEntity): Promise<void>;
  onReject(account: AccountEntity): Promise<void>;
}

const MembershipRequest: React.FC<IMembershipRequest> = ({ account, onAuthorize, onReject }) => {
  if (!account) return null;

  const handleAuthorize = () => onAuthorize(account);
  const handleReject = () => onReject(account);

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>

      <AuthorizeRejectButtons
        onAuthorize={handleAuthorize}
        onReject={handleReject}
        countdown={3000}
      />
    </HStack>
  );
};

interface IGroupMembershipRequests {
  params: RouteParams;
}

const GroupMembershipRequests: React.FC<IGroupMembershipRequests> = ({ params }) => {
  const groupId = params?.groupId;
  const intl = useIntl();

  const { group } = useGroup(groupId);

  const { accounts, authorize, reject, refetch, isLoading } = useGroupMembershipRequests(groupId);
  const { invalidate } = useGroupMembers(groupId, GroupRoles.USER);

  useEffect(() => () => {
    invalidate();
  }, []);

  if (!group || !group.relationship || isLoading) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['owner', 'admin', 'moderator'].includes(group.relationship.role)) {
    return <ColumnForbidden />;
  }

  const handleAuthorize = async (account: AccountEntity) =>
    authorize(account.id)
      .then(() => Promise.resolve())
      .catch((error: { response: PlfeResponse }) => {
        refetch();

        let message = intl.formatMessage(messages.authorizeFail, { name: account.username });
        if (error.response?.status === 409) {
          message = (error.response?.json as any).error;
        }
        toast.error(message);

        return Promise.reject();
      });

  const handleReject = async (account: AccountEntity) =>
    reject(account.id)
      .then(() => Promise.resolve())
      .catch((error: { response: PlfeResponse }) => {
        refetch();

        let message = intl.formatMessage(messages.rejectFail, { name: account.username });
        if (error.response?.status === 409) {
          message = (error.response?.json as any).error;
        }
        toast.error(message);

        return Promise.reject();
      });

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        emptyMessage={<FormattedMessage id='empty_column.group_membership_requests' defaultMessage='There are no pending membership requests for this group.' />}
      >
        {accounts.map((account) => (
          <MembershipRequest
            key={account.id}
            account={account}
            onAuthorize={handleAuthorize}
            onReject={handleReject}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { GroupMembershipRequests as default };
