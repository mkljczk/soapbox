import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useBirthdayReminders } from 'pl-fe/api/hooks/account-lists/use-birthday-reminders';
import { getCurrentDate } from 'pl-fe/components/birthday-panel';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import Account from 'pl-fe/features/birthdays/account';

import type { BaseModalProps } from '../modal-root';

const BirthdaysModal = ({ onClose }: BaseModalProps) => {
  const [[day, month]] = useState(getCurrentDate);
  const { data: accountIds } = useBirthdayReminders(month, day);

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
