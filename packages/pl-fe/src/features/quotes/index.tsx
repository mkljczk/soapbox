import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import StatusList from 'pl-fe/components/status-list';
import Column from 'pl-fe/components/ui/column';
import { useIsMobile } from 'pl-fe/hooks/use-is-mobile';
import { useTheme } from 'pl-fe/hooks/use-theme';
import { statusQuotesQueryOptions } from 'pl-fe/queries/statuses/status-quotes';

const messages = defineMessages({
  heading: { id: 'column.quotes', defaultMessage: 'Post quotes' },
});

const Quotes: React.FC = () => {
  const intl = useIntl();
  const { statusId } = useParams<{ statusId: string }>();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const { data: statusIds = [], isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(statusQuotesQueryOptions(statusId));

  const emptyMessage = <FormattedMessage id='empty_column.quotes' defaultMessage='This post has not been quoted yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent={!isMobile}>
      <StatusList
        className='black:p-0 black:sm:p-4 black:sm:pt-0'
        loadMoreClassName='black:sm:mx-4'
        statusIds={statusIds}
        scrollKey={`quotes:${statusId}`}
        hasMore={hasNextPage}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessage={emptyMessage}
        divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
      />
    </Column>
  );
};

export { Quotes as default };
