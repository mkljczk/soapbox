import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useFollowers } from 'pl-fe/api/hooks/accounts/use-account-list';
import { useAccountLookup } from 'pl-fe/api/hooks/accounts/use-account-lookup';
import Account from 'pl-fe/components/account';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';

const messages = defineMessages({
  heading: { id: 'column.followers', defaultMessage: 'Followers' },
});

interface IFollowers {
  params?: {
    username?: string;
  };
}

/** Displays a list of accounts who follow the given account. */
const Followers: React.FC<IFollowers> = ({ params }) => {
  const intl = useIntl();

  const { account, isUnavailable } = useAccountLookup(params?.username);

  const {
    accounts,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useFollowers(account?.id);

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  if (!account) {
    return (
      <MissingIndicator />
    );
  }

  if (isUnavailable) {
    return (
      <div className='empty-column-indicator'>
        <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
      </div>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <ScrollableList
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        emptyMessage={<FormattedMessage id='account.followers.empty' defaultMessage='No one follows this user yet.' />}
        itemClassName='pb-4'
      >
        {accounts.map((account) =>
          <Account key={account.id} account={account} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export { Followers as default };
