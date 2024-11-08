import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import {
  fetchEventParticipationRequests,
  rejectEventParticipationRequest,
  authorizeEventParticipationRequest,
  cancelEventCompose,
} from 'pl-fe/actions/events';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

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
  const dispatch = useAppDispatch();

  const handleAuthorize = () => {
    dispatch(authorizeEventParticipationRequest(eventId, id));
  };

  const handleReject = () => {
    dispatch(rejectEventParticipationRequest(eventId, id));
  };

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
            onClick={handleAuthorize}
          />
          <Button
            theme='danger'
            size='sm'
            text={intl.formatMessage(messages.reject)}
            onClick={handleReject}
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
  const dispatch = useAppDispatch();

  const accounts = useAppSelector((state) => state.user_lists.event_participation_requests[statusId]?.items);

  useEffect(() => {
    if (statusId) dispatch(fetchEventParticipationRequests(statusId));

    return () => {
      dispatch(cancelEventCompose());
    };
  }, [statusId]);

  return accounts ? (
    <Stack space={3}>
      <ScrollableList
        isLoading={!accounts}
        showLoading={!accounts}
        emptyMessage={<FormattedMessage id='empty_column.event_participant_requests' defaultMessage='There are no pending event participation requests.' />}
      >
        {accounts.map(({ account, participation_message }) =>
          <Account key={account} eventId={statusId!} id={account} participationMessage={participation_message} />,
        )}
      </ScrollableList>
    </Stack>
  ) : <Spinner />;
};

export { ManagePendingParticipants };
