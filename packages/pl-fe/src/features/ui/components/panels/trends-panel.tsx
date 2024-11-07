import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from '@tanstack/react-router';

import { setFilter } from 'pl-fe/actions/search';
import Hashtag from 'pl-fe/components/hashtag';
import Text from 'pl-fe/components/ui/text';
import Widget from 'pl-fe/components/ui/widget';
import PlaceholderSidebarTrends from 'pl-fe/features/placeholder/components/placeholder-sidebar-trends';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import useTrends from 'pl-fe/queries/trends';

interface ITrendsPanel {
  limit: number;
}

const messages = defineMessages({
  viewAll: {
    id: 'trends_panel.view_all',
    defaultMessage: 'View all',
  },
});

const TrendsPanel = ({ limit }: ITrendsPanel) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { data: trends, isFetching } = useTrends();

  const setHashtagsFilter = () => {
    dispatch(setFilter('', 'hashtags'));
  };

  if (!isFetching && !trends?.length) {
    return null;
  }

  return (
    <Widget
      title={<FormattedMessage id='trends.title' defaultMessage='Trends' />}
      action={
        <Link className='text-right' to='/search' onClick={setHashtagsFilter}>
          <Text tag='span' theme='primary' size='sm' className='hover:underline'>
            {intl.formatMessage(messages.viewAll)}
          </Text>
        </Link>
      }
    >
      {isFetching ? (
        <PlaceholderSidebarTrends limit={limit} />
      ) : (
        trends?.slice(0, limit).map((hashtag) => (
          <Hashtag key={hashtag.name} hashtag={hashtag} />
        ))
      )}
    </Widget>
  );
};

export { TrendsPanel as default };
