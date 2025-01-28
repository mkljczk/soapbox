import { useQuery } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Widget from 'pl-fe/components/ui/widget';
import AccountContainer from 'pl-fe/containers/account-container';
import { birthdayRemindersQueryOptions } from 'pl-fe/queries/accounts/birthday-reminders';

const timeToMidnight = () => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  return midnight.getTime() - now.getTime();
};

const getCurrentDate = () => {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;

  return [day, month];
};

interface IBirthdayPanel {
  limit: number;
}

const BirthdayPanel = ({ limit }: IBirthdayPanel) => {
  const [[day, month], setDate] = useState(getCurrentDate);

  const { data: birthdays = [] } = useQuery(birthdayRemindersQueryOptions(month, day));
  const birthdaysToRender = birthdays.slice(0, limit);

  const timeout = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const updateTimeout = () => {
      timeout.current = setTimeout(() => {
        setDate(getCurrentDate);
        updateTimeout();
      }, timeToMidnight());
    };

    updateTimeout();

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  if (!birthdaysToRender.length) {
    return null;
  }

  return (
    <Widget title={<FormattedMessage id='birthday_panel.title' defaultMessage='Birthdays' />}>
      {birthdaysToRender.map(accountId => (
        <AccountContainer
          key={accountId}
          // @ts-ignore: TS thinks `id` is passed to <Account>, but it isn't
          id={accountId}
          withRelationship={false}
        />
      ))}
    </Widget>
  );
};

export { BirthdayPanel as default, getCurrentDate };
