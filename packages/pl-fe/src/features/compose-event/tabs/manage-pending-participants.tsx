import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAcceptEventParticipationRequestMutation, useEventParticipationRequests } from 'pl-fe/queries/account-lists/use-event-participation-requests';

const messages = defineMessages({
  authorize: { id: 'compose_event.participation_requests.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'compose_event.participation_requests.reject', defaultMessage: 'Reject' },
});

interface IAccount {
  eventId: string;
  id: string;
  participationMessage: string | null;
}

const Account: React.FC<IAccount> = ({ eventId, id, participationMessage }) => {
  const intl = useIntl();

  const { mutate: acceptEventParticipationRequest } = useAcceptEventParticipationRequestMutation(eventId, id);
  const { mutate: rejectEventParticipationRequest } = useAcceptEventParticipationRequestMutation(eventId, id);

  return (
    <AccountContainer
      id={id}
      note={participationMessage || undefined}
      action={
        <HStack space={2}>
          <Button
            theme='secondary'
            size='sm'
            text={intl.formatMessage(messages.authorize)}
            onClick={() => acceptEventParticipationRequest()}
          />
          <Button
            theme='danger'
            size='sm'
            text={intl.formatMessage(messages.reject)}
            onClick={() => rejectEventParticipationRequest()}
          />
        </HStack>
      }
    />
  );
};

interface IManagePendingParticipants {
  statusId: string;
}

const ManagePendingParticipants: React.FC<IManagePendingParticipants> = ({ statusId }) => {
  const { data: accounts, isLoading, hasNextPage, fetchNextPage } = useEventParticipationRequests(statusId);

  return accounts ? (
    <Stack space={3}>
      <ScrollableList
        emptyMessage={<FormattedMessage id='empty_column.event_participant_requests' defaultMessage='There are no pending event participation requests.' />}
        hasMore={hasNextPage}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
      >
        {accounts.map(({ account_id, participation_message }) =>
          <Account key={account_id} eventId={statusId!} id={account_id} participationMessage={participation_message} />,
        )}
      </ScrollableList>
    </Stack>
  ) : <Spinner />;
};

export { ManagePendingParticipants };
