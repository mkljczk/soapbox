import React from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import Account from 'pl-fe/features/birthdays/account';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import type { BaseModalProps } from '../modal-root';

const BirthdaysModal = ({ onClose }: BaseModalProps) => {
  const accountIds = useAppSelector(state => state.user_lists.birthday_reminders.get(state.me as string)?.items);

  const onClickClose = () => {
    onClose('BIRTHDAYS');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='birthdays_modal.empty' defaultMessage='None of your friends have birthday today.' />;

    body = (
      <ScrollableList
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        estimatedSize={42}
      >
        {accountIds.map(id =>
          <Account key={id} accountId={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.birthdays' defaultMessage='Birthdays' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { BirthdaysModal as default };
