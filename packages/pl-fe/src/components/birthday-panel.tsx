import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchBirthdayReminders } from 'pl-fe/actions/accounts';
import Widget from 'pl-fe/components/ui/widget';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

const timeToMidnight = () => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  return midnight.getTime() - now.getTime();
};

interface IBirthdayPanel {
  limit: number;
}

const BirthdayPanel = ({ limit }: IBirthdayPanel) => {
  const dispatch = useAppDispatch();

  const birthdays = useAppSelector(state => state.user_lists.birthday_reminders[state.me as string]?.items || []);
  const birthdaysToRender = birthdays.slice(0, limit);

  const timeout = useRef<NodeJS.Timeout>();

  const handleFetchBirthdayReminders = () => {
    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth() + 1;

    dispatch(fetchBirthdayReminders(month, day))?.then(() => {
      timeout.current = setTimeout(() => handleFetchBirthdayReminders(), timeToMidnight());
    });
  };

  React.useEffect(() => {
    handleFetchBirthdayReminders();

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

export { BirthdayPanel as default };
