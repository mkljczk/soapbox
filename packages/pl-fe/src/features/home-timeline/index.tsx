import React, { useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchHomeTimeline } from 'pl-fe/actions/timelines';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useIsMobile } from 'pl-fe/hooks/use-is-mobile';
import { useTheme } from 'pl-fe/hooks/use-theme';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
});

const HomeTimeline: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const instance = useInstance();
  const theme = useTheme();

  const polling = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const isPartial = useAppSelector(state => state.timelines.home?.isPartial === true);

  const handleLoadMore = (maxId: string) => {
    dispatch(fetchHomeTimeline(true));
  };

  // Mastodon generates the feed in Redis, and can return a partial timeline
  // (HTTP 206) for new users. Poll until we get a full page of results.
  const checkIfReloadNeeded = () => {
    if (isPartial) {
      polling.current = setInterval(() => {
        dispatch(fetchHomeTimeline());
      }, 3000);
    } else {
      stopPolling();
    }
  };

  const stopPolling = () => {
    if (polling.current) {
      clearInterval(polling.current);
      polling.current = null;
    }
  };

  const handleRefresh = () => dispatch(fetchHomeTimeline(true));

  useEffect(() => {
    checkIfReloadNeeded();

    return () => {
      stopPolling();
    };
  }, [isPartial]);

  return (
    <Column className='py-0' label={intl.formatMessage(messages.title)} transparent={!isMobile} withHeader={false}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-0 black:sm:p-4 black:sm:pt-0'
          loadMoreClassName='black:sm:mx-4'
          scrollKey='home_timeline'
          onLoadMore={handleLoadMore}
          timelineId='home'
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
          emptyMessage={
            <Stack space={1}>
              <Text size='xl' weight='medium' align='center'>
                <FormattedMessage
                  id='empty_column.home.title'
                  defaultMessage="You're not following anyone yet"
                />
              </Text>

              <Text theme='muted' align='center'>
                <FormattedMessage
                  id='empty_column.home.subtitle'
                  defaultMessage='{siteTitle} gets more interesting once you follow other users.'
                  values={{ siteTitle: instance.title }}
                />
              </Text>

              {features.federating && (
                <Text theme='muted' align='center'>
                  <FormattedMessage
                    id='empty_column.home'
                    defaultMessage='Or you can visit {public} to get started and meet other users.'
                    values={{
                      public: (
                        <Link to='/timeline/local' className='text-primary-600 dark:text-primary-400 hover:underline'>
                          <FormattedMessage id='empty_column.home.local_tab' defaultMessage='the {site_title} tab' values={{ site_title: instance.title }} />
                        </Link>
                      ),
                    }}
                  />
                </Text>
              )}
            </Stack>
          }
        />
      </PullToRefresh>
    </Column>
  );
};

export { HomeTimeline as default };
