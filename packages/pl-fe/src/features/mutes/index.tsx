import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { useMutes } from 'pl-fe/api/hooks/accounts/use-account-list';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import AccountContainer from 'pl-fe/containers/account-container';

const messages = defineMessages({
  heading: { id: 'column.mutes', defaultMessage: 'Mutes' },
});

const Mutes: React.FC = () => {
  const intl = useIntl();

  const {
    accounts,
    hasNextPage: hasNextAccountsPage,
    fetchNextPage: fetchNextAccounts,
    isLoading: isLoadingAccounts,
  } = useMutes();

  const scrollableListProps = {
    itemClassName: 'pb-4 last:pb-0',
    scrollKey: 'mutes',
    emptyMessageCard: false,
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <ScrollableList
          {...scrollableListProps}
          isLoading={isLoadingAccounts}
          onLoadMore={fetchNextAccounts}
          hasMore={hasNextAccountsPage}
          emptyMessage={
            <FormattedMessage id='empty_column.mutes' defaultMessage="You haven't muted any users yet." />
          }
        >
          {accounts.map((accounts) =>
            <AccountContainer key={accounts.id} id={accounts.id} actionType='muting' />,
          )}
        </ScrollableList>
      </Stack>
    </Column>
  );
};

export { Mutes as default };
