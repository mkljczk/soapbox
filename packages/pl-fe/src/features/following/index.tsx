import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useFollowing } from 'pl-fe/api/hooks/accounts/use-account-list';
import { useAccountLookup } from 'pl-fe/api/hooks/accounts/use-account-lookup';
import Account from 'pl-fe/components/account';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';

const messages = defineMessages({
  heading: { id: 'column.following', defaultMessage: 'Following' },
});

interface IFollowing {
  params?: {
    username?: string;
  };
}

/** Displays a list of accounts the given user is following. */
const Following: React.FC<IFollowing> = ({ params }) => {
  const intl = useIntl();

  const { account, isUnavailable } = useAccountLookup(params?.username);

  const {
    accounts,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useFollowing(account?.id);

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
        emptyMessage={<FormattedMessage id='account.follows.empty' defaultMessage="This user doesn't follow anyone yet." />}
        itemClassName='pb-4'
      >
        {accounts.map((account) => (
          <Account key={account.id} account={account} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { Following as default };
