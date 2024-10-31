import clsx from 'clsx';
import debounce from 'lodash/debounce';
import { useMarker, useNotificationList, useUpdateMarkerMutation } from 'pl-hooks';
import React, { useCallback, useEffect, useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { dequeueNotifications } from 'pl-fe/actions/notifications';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import ScrollTopButton from 'pl-fe/components/scroll-top-button';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Portal from 'pl-fe/components/ui/portal';
import PlaceholderNotification from 'pl-fe/features/placeholder/components/placeholder-notification';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { compareId } from 'pl-fe/utils/comparators';
import { NotificationType } from 'pl-fe/utils/notification';

import FilterBar from './components/filter-bar';
import Notification from './components/notification';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  queue: { id: 'notifications.queue_label', defaultMessage: 'Click to see {count} new {count, plural, one {notification} other {notifications}}' },
});

type SpecifiedFilterType = 'mention' | 'favourite' | 'reblog' | 'poll' | 'status' | 'follow' | 'events';
type FilterType = SpecifiedFilterType | 'all';

const FILTER_TYPES: { all: undefined } & Record<SpecifiedFilterType, Array<NotificationType>> = {
  all: undefined,
  mention: ['mention'],
  favourite: ['favourite', 'emoji_reaction'],
  reblog: ['reblog'],
  poll: ['poll'],
  status: ['status'],
  follow: ['follow', 'follow_request'],
  events: ['event_reminder', 'participation_request', 'participation_accepted'],
};

const Notifications = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const settings = useSettings();

  const activeFilter = settings.notifications.quickFilter.active as FilterType;

  const params = activeFilter === 'all' ? {} : {
    types: FILTER_TYPES[activeFilter] || [activeFilter] as Array<NotificationType>,
  };

  const notificationListQuery = useNotificationList(params);

  const markerQuery = useMarker('notifications');
  const updateMarkerMutation = useUpdateMarkerMutation('notifications');

  const notifications = notificationListQuery.data;

  const showFilterBar = settings.notifications.quickFilter.show;
  const totalQueuedNotificationsCount = useAppSelector(state => state.notifications.totalQueuedNotificationsCount || 0);

  const scrollableContentRef = useRef<Array<JSX.Element> | null>(null);

  // const handleLoadGap = (maxId) => {
  //   dispatch(expandNotifications({ maxId }));
  // };

  const handleLoadOlder = useCallback(debounce(() => {
    if (notificationListQuery.hasNextPage) notificationListQuery.fetchNextPage();
  }, 300, { leading: true }), [notificationListQuery.hasNextPage]);

  const handleScrollToTop = () => {
    const topNotificationId = notificationListQuery.data[0];
    const lastReadId = markerQuery.data?.last_read_id || -1;

    if (topNotificationId && (lastReadId === -1 || compareId(topNotificationId, lastReadId) > 0)) {
      updateMarkerMutation.mutate(topNotificationId);
    }
  };

  const handleScroll = useCallback(debounce((startIndex?: number) => {
    if (startIndex !== 0) return;

    handleScrollToTop();
  }, 100), [handleScrollToTop]);

  const handleMoveUp = (id: string) => {
    const elementIndex = notifications.findIndex(item => item !== null && item === id) - 1;
    _selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = notifications.findIndex(item => item !== null && item === id) + 1;
    _selectChild(elementIndex);
  };

  const _selectChild = (index: number) => {
    const selector = `[data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();
  };

  const handleDequeueNotifications = useCallback(() => {
    dispatch(dequeueNotifications());
  }, []);

  const handleRefresh = useCallback(() => notificationListQuery.refetch(), []);

  useEffect(() => {
    handleDequeueNotifications();
    handleScrollToTop();

    return () => {
      handleLoadOlder.cancel();
      handleScroll.cancel();
    };
  }, []);

  const emptyMessage = activeFilter === 'all'
    ? <FormattedMessage id='empty_column.notifications' defaultMessage="You don't have any notifications yet. Interact with others to start the conversation." />
    : <FormattedMessage id='empty_column.notifications_filtered' defaultMessage="You don't have any notifications of this type yet." />;

  let scrollableContent: Array<JSX.Element> | null = null;

  const filterBarContainer = showFilterBar
    ? (<FilterBar />)
    : null;

  if (notificationListQuery.isLoading && scrollableContentRef.current) {
    scrollableContent = scrollableContentRef.current;
  } else if (notifications.length > 0 || notificationListQuery.hasNextPage) {
    scrollableContent = notifications.map((notificationId) => (
      <Notification
        key={notificationId}
        id={notificationId}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    ));
  } else {
    scrollableContent = null;
  }

  scrollableContentRef.current = scrollableContent;

  const scrollContainer = (
    <ScrollableList
      isLoading={notificationListQuery.isFetching}
      showLoading={notificationListQuery.isLoading}
      hasMore={notificationListQuery.hasNextPage}
      emptyMessage={emptyMessage}
      placeholderComponent={PlaceholderNotification}
      placeholderCount={20}
      onLoadMore={handleLoadOlder}
      onScroll={handleScroll}
      listClassName={clsx('divide-y divide-solid divide-gray-200 black:divide-gray-800 dark:divide-primary-800', {
        'animate-pulse': notifications.length === 0,
      })}
    >
      {scrollableContent!}
    </ScrollableList>
  );

  return (
    <Column label={intl.formatMessage(messages.title)} withHeader={false}>
      {filterBarContainer}

      <Portal>
        <ScrollTopButton
          onClick={handleDequeueNotifications}
          count={totalQueuedNotificationsCount}
          message={messages.queue}
        />
      </Portal>

      <PullToRefresh onRefresh={handleRefresh}>
        {scrollContainer}
      </PullToRefresh>
    </Column>
  );
};

export { Notifications as default, FILTER_TYPES, type FilterType };
