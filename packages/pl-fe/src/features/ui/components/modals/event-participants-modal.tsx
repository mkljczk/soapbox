import React from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import { useEventParticipations } from 'pl-fe/queries/account-lists/use-event-participations';

import type { BaseModalProps } from '../modal-root';

interface EventParticipantsModalProps {
  statusId: string;
}

const EventParticipantsModal: React.FC<BaseModalProps & EventParticipantsModalProps> = ({ onClose, statusId }) => {
  const { data: accountIds, isLoading, hasNextPage, fetchNextPage } = useEventParticipations(statusId);

  const onClickClose = () => {
    onClose('EVENT_PARTICIPANTS');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='empty_column.event_participants' defaultMessage='No one joined this event yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        estimatedSize={42}
        hasMore={hasNextPage}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
      >
        {accountIds.map(id => <AccountContainer key={id} id={id} />)}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.event_participants' defaultMessage='Event participants' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { EventParticipantsModal as default, type EventParticipantsModalProps };
