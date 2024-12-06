import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import { useFollowRequests } from 'pl-fe/queries/accounts/use-follow-requests';

import AccountAuthorize from './components/account-authorize';

const messages = defineMessages({
  heading: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
});

const FollowRequests: React.FC = () => {
  const intl = useIntl();

  const { data: accountIds, isLoading, hasNextPage, fetchNextPage } = useFollowRequests();

  if (!accountIds) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.follow_requests' defaultMessage="You don't have any follow requests yet. When you receive one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        hasMore={hasNextPage}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessage={emptyMessage}
      >
        {accountIds.map(id =>
          <AccountAuthorize key={id} id={id} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export { FollowRequests as default };
