import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import { scheduledStatusesQueryOptions } from 'pl-fe/queries/statuses/scheduled-statuses';

import ScheduledStatus from './components/scheduled-status';

const messages = defineMessages({
  heading: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
});

const ScheduledStatuses = () => {
  const intl = useIntl();

  const { data: scheduledStatuses = [], isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(scheduledStatusesQueryOptions);

  const emptyMessage = <FormattedMessage id='empty_column.scheduled_statuses' defaultMessage="You don't have any scheduled statuses yet. When you add one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        hasMore={hasNextPage}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessage={emptyMessage}
        listClassName='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
      >
        {scheduledStatuses.map((status) => <ScheduledStatus key={status.id} scheduledStatus={status} />)}
      </ScrollableList>
    </Column>
  );
};

export { ScheduledStatuses as default };
