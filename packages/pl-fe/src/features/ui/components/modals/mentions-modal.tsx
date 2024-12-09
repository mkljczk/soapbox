import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import { useStatus } from 'pl-fe/queries/statuses/status';

import type { BaseModalProps } from '../modal-root';

interface MentionsModalProps {
  statusId: string;
}

const MentionsModal: React.FC<BaseModalProps & MentionsModalProps> = ({ onClose, statusId }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const { data: status } = useStatus(statusId);
  const accountIds = status ? status.mentions.map(m => m.id) : null;

  const onClickClose = () => {
    onClose('MENTIONS');
  };

  useEffect(() => {
    fetchData();
  }, []);

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    body = (
      <ScrollableList
        listClassName='max-w-full'
        itemClassName='pb-3'
        estimatedSize={42}
        parentRef={modalRef}
      >
        {accountIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.mentions' defaultMessage='Mentions' />}
      onClose={onClickClose}
      ref={modalRef}
    >
      {body}
    </Modal>
  );
};

export { MentionsModal as default, type MentionsModalProps };
