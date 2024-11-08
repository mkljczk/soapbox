import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchUsers } from 'pl-fe/actions/admin';
import Widget from 'pl-fe/components/ui/widget';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

const messages = defineMessages({
  title: { id: 'admin.latest_accounts_panel.title', defaultMessage: 'Latest Accounts' },
  expand: { id: 'admin.latest_accounts_panel.more', defaultMessage: 'Click to see {count, plural, one {# account} other {# accounts}}' },
});

interface ILatestAccountsPanel {
  limit?: number;
}

const LatestAccountsPanel: React.FC<ILatestAccountsPanel> = ({ limit = 5 }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const accountIds = useAppSelector<Array<string>>((state) => state.admin.latestUsers.slice(0, limit));

  const [total, setTotal] = useState<number | undefined>(accountIds.length);

  useEffect(() => {
    dispatch(fetchUsers({
      origin: 'local',
      status: 'active',
      limit,
    })).then((value) => {
      setTotal(value.total);
    }).catch(() => {});
  }, []);

  const handleAction = () => {
    history.push('/pl-fe/admin/users');
  };

  return (
    <Widget
      title={intl.formatMessage(messages.title)}
      onActionClick={handleAction}
      actionTitle={intl.formatMessage(messages.expand, { count: total })}
    >
      {accountIds.slice(0, limit).map((account) => (
        <AccountContainer key={account} id={account} withRelationship={false} withDate />
      ))}
    </Widget>
  );
};

export { LatestAccountsPanel as default };
