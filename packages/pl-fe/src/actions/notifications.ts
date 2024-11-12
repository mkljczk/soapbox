import IntlMessageFormat from 'intl-messageformat';
import 'intl-pluralrules';
import { importEntities, queryClient } from 'pl-hooks';
import { defineMessages } from 'react-intl';

import { FILTER_TYPES, type FilterType } from 'pl-fe/features/notifications';
import { getNotificationStatus } from 'pl-fe/features/notifications/components/notification';
import { normalizeNotification } from 'pl-fe/normalizers/notification';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { unescapeHTML } from 'pl-fe/utils/html';
import { joinPublicPath } from 'pl-fe/utils/static';

import { fetchRelationships } from './accounts';
import { saveSettings } from './settings';

import type { NotificationGroup } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const NOTIFICATIONS_UPDATE = 'NOTIFICATIONS_UPDATE' as const;
const NOTIFICATIONS_UPDATE_QUEUE = 'NOTIFICATIONS_UPDATE_QUEUE' as const;
const NOTIFICATIONS_DEQUEUE = 'NOTIFICATIONS_DEQUEUE' as const;

const NOTIFICATIONS_FILTER_SET = 'NOTIFICATIONS_FILTER_SET' as const;

const MAX_QUEUED_NOTIFICATIONS = 40;

defineMessages({
  mention: { id: 'notification.mention', defaultMessage: '{name} mentioned you' },
});

const fetchRelatedRelationships = (dispatch: AppDispatch, notifications: Array<NotificationGroup>) => {
  const accountIds = notifications.filter(item => item.type === 'follow').map(item => item.sample_account_ids).flat();

  if (accountIds.length > 0) {
    dispatch(fetchRelationships(accountIds));
  }
};

const updateNotifications = (notification: Notification) =>
  (dispatch: AppDispatch) => {
    const selectedFilter = useSettingsStore.getState().settings.notifications.quickFilter.active;
    const showInColumn = selectedFilter === 'all' ? true : (FILTER_TYPES[selectedFilter as FilterType] || [notification.type]).includes(notification.type);

    importEntities({ notifications: [{ ...notification, accounts: [notification.account], duplicate: false }] });

    if (showInColumn) {
      const normalizedNotification = normalizeNotification(notification);

      dispatch({
        type: NOTIFICATIONS_UPDATE,
        notification: normalizedNotification,
      });

      fetchRelatedRelationships(dispatch, [normalizedNotification]);
    }
  };

const updateNotificationsQueue = (notification: Notification, intlMessages: Record<string, string>, intlLocale: string, curPath: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!notification.type) return; // drop invalid notifications
    if (notification.type === 'chat_mention') return; // Drop chat notifications, handle them per-chat

    // TODO: Restore filtering
    // const filters = getFilters(getState(), { contextType: 'notifications' });

    const status = getNotificationStatus(notification);

    // let filtered: boolean | null = false;

    const isOnNotificationsPage = curPath === '/notifications';

    // if (notification.type === 'mention' || notification.type === 'status') {
    //   const regex = regexFromFilters(filters);
    //   const searchIndex = notification.status.spoiler_text + '\n' + unescapeHTML(notification.status.content);
    //   filtered = regex && regex.test(searchIndex);
    // }

    // Desktop notifications
    try {
      // eslint-disable-next-line compat/compat
      const isNotificationsEnabled = window.Notification?.permission === 'granted';

      if (/* !filtered && */ isNotificationsEnabled) {
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
    // dispatch(markReadNotifications());
  };

const setFilter = (filterType: FilterType, abort?: boolean) =>
  (dispatch: AppDispatch) => {
    const settingsStore = useSettingsStore.getState();
    const activeFilter = settingsStore.settings.notifications.quickFilter.active as FilterType;

    settingsStore.changeSetting(['notifications', 'quickFilter', 'active'], filterType);

    queryClient.resetQueries({
      queryKey: ['notifications', 'lists', filterType === 'all' ? 'all' : FILTER_TYPES[filterType].join('|')],
    });

    if (activeFilter !== filterType) dispatch(saveSettings());
  };

export {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_UPDATE_QUEUE,
  NOTIFICATIONS_DEQUEUE,
  NOTIFICATIONS_FILTER_SET,
  MAX_QUEUED_NOTIFICATIONS,
  type FilterType,
  updateNotifications,
  updateNotificationsQueue,
  dequeueNotifications,
  setFilter,
};
