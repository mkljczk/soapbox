import IntlMessageFormat from 'intl-messageformat';
import 'intl-pluralrules';
import { defineMessages } from 'react-intl';

import { getNotificationStatus } from 'pl-fe/features/notifications/components/notification';
import { normalizeNotification } from 'pl-fe/normalizers';
import { getFilters, regexFromFilters } from 'pl-fe/selectors';
import { isLoggedIn } from 'pl-fe/utils/auth';
import { compareId } from 'pl-fe/utils/comparators';
import { unescapeHTML } from 'pl-fe/utils/html';
import { joinPublicPath } from 'pl-fe/utils/static';

import { fetchRelationships } from './accounts';
import {
  importFetchedAccount,
  importFetchedStatus,
} from './importer';
import { saveMarker } from './markers';
import { getSettings, saveSettings } from './settings';

import type { Notification as BaseNotification } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const NOTIFICATIONS_UPDATE = 'NOTIFICATIONS_UPDATE' as const;
const NOTIFICATIONS_UPDATE_NOOP = 'NOTIFICATIONS_UPDATE_NOOP' as const;
const NOTIFICATIONS_UPDATE_QUEUE = 'NOTIFICATIONS_UPDATE_QUEUE' as const;
const NOTIFICATIONS_DEQUEUE = 'NOTIFICATIONS_DEQUEUE' as const;

const NOTIFICATIONS_FILTER_SET = 'NOTIFICATIONS_FILTER_SET' as const;

const NOTIFICATIONS_CLEAR = 'NOTIFICATIONS_CLEAR' as const;
const NOTIFICATIONS_SCROLL_TOP = 'NOTIFICATIONS_SCROLL_TOP' as const;

const NOTIFICATIONS_MARK_READ_REQUEST = 'NOTIFICATIONS_MARK_READ_REQUEST' as const;
const NOTIFICATIONS_MARK_READ_SUCCESS = 'NOTIFICATIONS_MARK_READ_SUCCESS' as const;
const NOTIFICATIONS_MARK_READ_FAIL = 'NOTIFICATIONS_MARK_READ_FAIL' as const;

const MAX_QUEUED_NOTIFICATIONS = 40;

type FILTER_TYPES = {
  all: undefined;
  mention: ['mention'];
  favourite: ['favourite', 'emoji_reaction'];
  reblog: ['reblog'];
  poll: ['poll'];
  status: ['status'];
  follow: ['follow', 'follow_request'];
  events: ['event_reminder', 'participation_request', 'participation_accepted'];
};

type FilterType = keyof FILTER_TYPES;

defineMessages({
  mention: { id: 'notification.mention', defaultMessage: '{name} mentioned you' },
});

const fetchRelatedRelationships = (dispatch: AppDispatch, notifications: Array<BaseNotification>) => {
  const accountIds = notifications.filter(item => item.type === 'follow').map(item => item.account.id);

  if (accountIds.length > 0) {
    dispatch(fetchRelationships(accountIds));
  }
};

const updateNotifications = (notification: BaseNotification) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const showInColumn = getSettings(getState()).getIn(['notifications', 'shows', notification.type], true);

    if (notification.account) {
      dispatch(importFetchedAccount(notification.account));
    }

    // Used by Move notification
    if (notification.type === 'move' && notification.target) {
      dispatch(importFetchedAccount(notification.target));
    }

    const status = getNotificationStatus(notification);

    if (status) {
      dispatch(importFetchedStatus(status));
    }

    if (showInColumn) {
      dispatch({
        type: NOTIFICATIONS_UPDATE,
        notification: normalizeNotification(notification),
      });

      fetchRelatedRelationships(dispatch, [notification]);
    }
  };

const updateNotificationsQueue = (notification: BaseNotification, intlMessages: Record<string, string>, intlLocale: string, curPath: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!notification.type) return; // drop invalid notifications
    if (notification.type === 'chat_mention') return; // Drop chat notifications, handle them per-chat

    const filters = getFilters(getState(), { contextType: 'notifications' });
    const playSound = getSettings(getState()).getIn(['notifications', 'sounds', notification.type]);

    const status = getNotificationStatus(notification);

    let filtered: boolean | null = false;

    const isOnNotificationsPage = curPath === '/notifications';

    if (notification.type === 'mention' || notification.type === 'status') {
      const regex = regexFromFilters(filters);
      const searchIndex = notification.status.spoiler_text + '\n' + unescapeHTML(notification.status.content);
      filtered = regex && regex.test(searchIndex);
    }

    // Desktop notifications
    try {
      // eslint-disable-next-line compat/compat
      const isNotificationsEnabled = window.Notification?.permission === 'granted';

      if (!filtered && isNotificationsEnabled) {
        const title = new IntlMessageFormat(intlMessages[`notification.${notification.type}`], intlLocale).format({ name: notification.account.display_name.length > 0 ? notification.account.display_name : notification.account.username }) as string;
        const body = (status && status.spoiler_text.length > 0) ? status.spoiler_text : unescapeHTML(status ? status.content : '');

        navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
          serviceWorkerRegistration.showNotification(title, {
            body,
            icon: notification.account.avatar,
            tag: notification.id,
            data: {
              url: joinPublicPath('/notifications'),
            },
          }).catch(console.error);
        }).catch(console.error);
      }
    } catch (e) {
      console.warn(e);
    }

    if (playSound && !filtered) {
      dispatch({
        type: NOTIFICATIONS_UPDATE_NOOP,
        meta: { sound: 'boop' },
      });
    }

    if (isOnNotificationsPage) {
      dispatch({
        type: NOTIFICATIONS_UPDATE_QUEUE,
        notification,
        intlMessages,
        intlLocale,
      });
    } else {
      dispatch(updateNotifications(notification));
    }
  };

const dequeueNotifications = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const queuedNotifications = getState().notifications.queuedNotifications;
    const totalQueuedNotificationsCount = getState().notifications.totalQueuedNotificationsCount;

    if (totalQueuedNotificationsCount === 0) {
      return;
    } else if (totalQueuedNotificationsCount > 0 && totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS) {
      queuedNotifications.forEach((block) => {
        dispatch(updateNotifications(block.notification));
      });
    } else {
      // dispatch(expandNotifications());
    }

    dispatch({
      type: NOTIFICATIONS_DEQUEUE,
    });
    dispatch(markReadNotifications());
  };

const scrollTopNotifications = (top: boolean) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: NOTIFICATIONS_SCROLL_TOP,
      top,
    });
    dispatch(markReadNotifications());
  };

const setFilter = (filterType: FilterType, abort?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const activeFilter = getSettings(getState()).getIn(['notifications', 'quickFilter', 'active']);

    dispatch({
      type: NOTIFICATIONS_FILTER_SET,
      path: ['notifications', 'quickFilter', 'active'],
      value: filterType,
    });
    if (activeFilter !== filterType) dispatch(saveSettings());
  };

const markReadNotifications = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const state = getState();
    const topNotificationId = state.notifications.items.first()?.id;
    const lastReadId = state.notifications.lastRead;

    if (topNotificationId && (lastReadId === -1 || compareId(topNotificationId, lastReadId) > 0)) {
      const marker = {
        notifications: {
          last_read_id: topNotificationId,
        },
      };

      dispatch(saveMarker(marker));
    }
  };

export {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_UPDATE_NOOP,
  NOTIFICATIONS_UPDATE_QUEUE,
  NOTIFICATIONS_DEQUEUE,
  NOTIFICATIONS_FILTER_SET,
  NOTIFICATIONS_CLEAR,
  NOTIFICATIONS_SCROLL_TOP,
  NOTIFICATIONS_MARK_READ_REQUEST,
  NOTIFICATIONS_MARK_READ_SUCCESS,
  NOTIFICATIONS_MARK_READ_FAIL,
  MAX_QUEUED_NOTIFICATIONS,
  type FilterType,
  updateNotifications,
  updateNotificationsQueue,
  dequeueNotifications,
  scrollTopNotifications,
  setFilter,
  markReadNotifications,
};
