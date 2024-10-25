import debounce from 'lodash/debounce';
import React, { useCallback } from 'react';
import { defineMessages } from 'react-intl';

import { dequeueTimeline, scrollTopTimeline } from 'pl-fe/actions/timelines';
import ScrollTopButton from 'pl-fe/components/scroll-top-button';
import StatusList, { IStatusList } from 'pl-fe/components/status-list';
import Portal from 'pl-fe/components/ui/portal';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetStatusIds } from 'pl-fe/selectors';

const messages = defineMessages({
  queue: { id: 'status_list.queue_label', defaultMessage: 'Click to see {count} new {count, plural, one {post} other {posts}}' },
});

interface ITimeline extends Omit<IStatusList, 'statusIds' | 'isLoading' | 'hasMore'> {
  /** Unique key to preserve the scroll position when navigating back. */
  scrollKey: string;
  /** ID of the timeline in Redux. */
  timelineId: string;
  /** Settings path to use instead of the timelineId. */
  prefix?: string;
}

/** Scrollable list of statuses from a timeline in the Redux store. */
const Timeline: React.FC<ITimeline> = ({
  timelineId,
  onLoadMore,
  prefix,
  ...rest
}) => {
  const dispatch = useAppDispatch();
  const getStatusIds = useCallback(makeGetStatusIds(), []);

  const statusIds = useAppSelector(state => getStatusIds(state, { type: timelineId, prefix }));
  const lastStatusId = statusIds.last();
  const isLoading = useAppSelector(state => (state.timelines.get(timelineId) || { isLoading: true }).isLoading === true);
  const isPartial = useAppSelector(state => (state.timelines.get(timelineId)?.isPartial || false) === true);
  const hasMore = useAppSelector(state => state.timelines.get(timelineId)?.hasMore === true);
  const totalQueuedItemsCount = useAppSelector(state => state.timelines.get(timelineId)?.totalQueuedItemsCount || 0);

  const handleDequeueTimeline = useCallback(() => {
    dispatch(dequeueTimeline(timelineId, onLoadMore));
  }, []);

  const handleScroll = useCallback(debounce((startIndex?: number) => {
    dispatch(scrollTopTimeline(timelineId, startIndex === 0));
  }, 100), [timelineId]);

  return (
    <>
      <Portal>
        <ScrollTopButton
          key='timeline-queue-button-header'
          onClick={handleDequeueTimeline}
          count={totalQueuedItemsCount}
          message={messages.queue}
        />
      </Portal>

      <StatusList
        timelineId={timelineId}
        onScroll={handleScroll}
        lastStatusId={lastStatusId}
        statusIds={statusIds}
        isLoading={isLoading}
        isPartial={isPartial}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        {...rest}
      />
    </>
  );
};

export { Timeline as default };
