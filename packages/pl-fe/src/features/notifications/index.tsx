import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createSelector } from 'reselect';

import {
  expandNotifications,
  markReadNotifications,
  scrollTopNotifications,
} from 'pl-fe/actions/notifications';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import ScrollTopButton from 'pl-fe/components/scroll-top-button';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Portal from 'pl-fe/components/ui/portal';
import PlaceholderNotification from 'pl-fe/features/placeholder/components/placeholder-notification';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useSettings } from 'pl-fe/hooks/use-settings';

import FilterBar from './components/filter-bar';
import Notification from './components/notification';

import type { RootState } from 'pl-fe/store';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  queue: { id: 'notifications.queue_label', defaultMessage: 'Click to see {count} new {count, plural, one {notification} other {notifications}}' },
});

const getNotifications = createSelector([
  (state: RootState) => state.notifications.items,
  (_, topNotification?: string) => topNotification,
], (notifications, topNotificationId) => {
  if (topNotificationId) {
    const queuedNotificationCount = notifications.findIndex((notification) =>
      notification.most_recent_notification_id <= topNotificationId,
    );
    const displayedNotifications = notifications.slice(queuedNotificationCount);

    return {
      queuedNotificationCount,
      displayedNotifications,
    };
  }

  return {
    queuedNotificationCount: 0,
    displayedNotifications: notifications,
  };
});

const Notifications = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const settings = useSettings();

  const showFilterBar = settings.notifications.quickFilter.show;
  const activeFilter = settings.notifications.quickFilter.active;
  const [topNotification, setTopNotification] = useState<string>();
  const { queuedNotificationCount, displayedNotifications } = useAppSelector(state => getNotifications(state, topNotification));
  const isLoading = useAppSelector(state => state.notifications.isLoading);
  // const isUnread = useAppSelector(state => state.notifications.unread > 0);
  const hasMore = useAppSelector(state => state.notifications.hasMore);

  const scrollableContentRef = useRef<Array<JSX.Element> | null>(null);

  // const handleLoadGap = (maxId) => {
  //   dispatch(expandNotifications({ maxId }));
  // };

  const handleLoadOlder = useCallback(debounce(() => {
    const minId = displayedNotifications.reduce<string | undefined>(
      (minId, notification) => minId && notification.page_min_id && notification.page_min_id > minId
        ? minId
        : notification.page_min_id,
      undefined,
    );
    dispatch(expandNotifications({ maxId: minId }));
  }, 300, { leading: true }), [displayedNotifications]);

  const handleScroll = useCallback(debounce((startIndex?: number) => {
    dispatch(scrollTopNotifications(startIndex === 0));
  }, 100), []);

  const handleMoveUp = (id: string) => {
    const elementIndex = displayedNotifications.findIndex(item => item !== null && item.group_key === id) - 1;
    _selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = displayedNotifications.findIndex(item => item !== null && item.group_key === id) + 1;
    _selectChild(elementIndex);
  };

  const _selectChild = (index: number) => {
    const selector = `[data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();
  };

  const handleDequeueNotifications = useCallback(() => {
    setTopNotification(undefined);
    dispatch(markReadNotifications());
  }, []);

  const handleRefresh = useCallback(() => dispatch(expandNotifications()), []);

  useEffect(() => {
    handleDequeueNotifications();
    dispatch(scrollTopNotifications(true));

    return () => {
      handleLoadOlder.cancel();
      handleScroll.cancel();
      dispatch(scrollTopNotifications(false));
    };
  }, []);

  useEffect(() => {
    if (topNotification || displayedNotifications.length === 0) return;
    setTopNotification(displayedNotifications[0].most_recent_notification_id);
  }, [displayedNotifications.length]);

  const emptyMessage = activeFilter === 'all'
    ? <FormattedMessage id='empty_column.notifications' defaultMessage="You don't have any notifications yet. Interact with others to start the conversation." />
    : <FormattedMessage id='empty_column.notifications_filtered' defaultMessage="You don't have any notifications of this type yet." />;

  let scrollableContent: Array<JSX.Element> | null = null;

  const filterBarContainer = showFilterBar
    ? (<FilterBar />)
    : null;

  if (isLoading && scrollableContentRef.current) {
    scrollableContent = scrollableContentRef.current;
  } else if (displayedNotifications.length > 0 || hasMore) {
    scrollableContent = displayedNotifications.map((item) => (
      <Notification
        key={item.group_key}
        notification={item}
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
      isLoading={isLoading}
      showLoading={isLoading && displayedNotifications.length === 0}
      hasMore={hasMore}
      emptyMessage={emptyMessage}
      placeholderComponent={PlaceholderNotification}
      placeholderCount={20}
      onLoadMore={handleLoadOlder}
      onScroll={handleScroll}
      listClassName={clsx('divide-y divide-solid divide-gray-200 black:divide-gray-800 dark:divide-primary-800', {
        'animate-pulse': displayedNotifications.length === 0,
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
          count={queuedNotificationCount}
          message={messages.queue}
        />
      </Portal>

      <PullToRefresh onRefresh={handleRefresh}>
        {scrollContainer}
      </PullToRefresh>
    </Column>
  );
};

export { Notifications as default };
