import IntlMessageFormat from 'intl-messageformat';
import 'intl-pluralrules';
import { defineMessages } from 'react-intl';

import { getClient } from 'pl-fe/api';
import { getNotificationStatus } from 'pl-fe/features/notifications/components/notification';
import { normalizeNotification } from 'pl-fe/normalizers/notification';
import { getFilters, regexFromFilters } from 'pl-fe/selectors';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { isLoggedIn } from 'pl-fe/utils/auth';
import { unescapeHTML } from 'pl-fe/utils/html';
import { EXCLUDE_TYPES, NOTIFICATION_TYPES } from 'pl-fe/utils/notification';
import { joinPublicPath } from 'pl-fe/utils/static';

import { fetchRelationships } from './accounts';
import { importEntities } from './importer';
import { saveSettings } from './settings';

import type { Notification as BaseNotification, GetGroupedNotificationsParams, GroupedNotificationsResults, NotificationGroup, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const NOTIFICATIONS_UPDATE = 'NOTIFICATIONS_UPDATE' as const;
const NOTIFICATIONS_UPDATE_NOOP = 'NOTIFICATIONS_UPDATE_NOOP' as const;

const NOTIFICATIONS_EXPAND_REQUEST = 'NOTIFICATIONS_EXPAND_REQUEST' as const;
const NOTIFICATIONS_EXPAND_SUCCESS = 'NOTIFICATIONS_EXPAND_SUCCESS' as const;
const NOTIFICATIONS_EXPAND_FAIL = 'NOTIFICATIONS_EXPAND_FAIL' as const;

const NOTIFICATIONS_FILTER_SET = 'NOTIFICATIONS_FILTER_SET' as const;

const MAX_QUEUED_NOTIFICATIONS = 40;

const FILTER_TYPES = {
  all: undefined,
  mention: ['mention'],
  favourite: ['favourite', 'emoji_reaction'],
  reblog: ['reblog'],
  poll: ['poll'],
  status: ['status'],
  follow: ['follow', 'follow_request'],
  events: ['event_reminder', 'participation_request', 'participation_accepted'],
};

type FilterType = keyof typeof FILTER_TYPES;

defineMessages({
  mention: { id: 'notification.mention', defaultMessage: '{name} mentioned you' },
});

const fetchRelatedRelationships = (dispatch: AppDispatch, notifications: Array<NotificationGroup>) => {
  const accountIds = notifications.filter(item => item.type === 'follow').map(item => item.sample_account_ids).flat();

  if (accountIds.length > 0) {
    dispatch(fetchRelationships(accountIds));
  }
};

interface NotificationsUpdateAction {
  type: typeof NOTIFICATIONS_UPDATE;
  notification: NotificationGroup;
}

const updateNotifications = (notification: BaseNotification) =>
  (dispatch: AppDispatch) => {
    const selectedFilter = useSettingsStore.getState().settings.notifications.quickFilter.active;
    const showInColumn = selectedFilter === 'all' ? true : (FILTER_TYPES[selectedFilter as FilterType] || [notification.type]).includes(notification.type);

    dispatch(importEntities({
      accounts: [notification.account, notification.type === 'move' ? notification.target : undefined],
      statuses: [getNotificationStatus(notification) as any],
    }));

    if (showInColumn) {
      const normalizedNotification = normalizeNotification(notification);

      dispatch<NotificationsUpdateAction>({
        type: NOTIFICATIONS_UPDATE,
        notification: normalizedNotification,
      });

      fetchRelatedRelationships(dispatch, [normalizedNotification]);
    }
  };

interface NotificationsUpdateNoopAction {
  type: typeof NOTIFICATIONS_UPDATE_NOOP;
  meta: { sound: 'boop' };
}

const updateNotificationsQueue = (notification: BaseNotification, intlMessages: Record<string, string>, intlLocale: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!notification.type) return; // drop invalid notifications
    if (notification.type === 'chat_mention') return; // Drop chat notifications, handle them per-chat

    const filters = getFilters(getState(), { contextType: 'notifications' });
    const playSound = useSettingsStore.getState().settings.notifications.sounds[notification.type];

    const status = getNotificationStatus(notification);

    let filtered: boolean | null = false;

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
      dispatch<NotificationsUpdateNoopAction>({
        type: NOTIFICATIONS_UPDATE_NOOP,
        meta: { sound: 'boop' },
      });
    }

    dispatch(updateNotifications(notification));
  };

const excludeTypesFromFilter = (filters: string[]) => NOTIFICATION_TYPES.filter(item => !filters.includes(item));

const noOp = () => new Promise(f => f(undefined));

let abortExpandNotifications = new AbortController();

const expandNotifications = ({ maxId }: Record<string, any> = {}, done: () => any = noOp, abort?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp);
    const state = getState();

    const features = state.auth.client.features;
    const activeFilter = useSettingsStore.getState().settings.notifications.quickFilter.active as FilterType;
    const notifications = state.notifications;

    if (notifications.isLoading) {
      if (abort) {
        abortExpandNotifications.abort();
        abortExpandNotifications = new AbortController();
      } else {
        done();
        return dispatch(noOp);
      }
    }

    const params: GetGroupedNotificationsParams = {
      max_id: maxId,
    };

    if (activeFilter === 'all') {
      if (features.notificationsIncludeTypes) {
        params.types = NOTIFICATION_TYPES.filter(type => !EXCLUDE_TYPES.includes(type as any));
      } else {
        params.exclude_types = [...EXCLUDE_TYPES];
      }
    } else {
      const filtered = FILTER_TYPES[activeFilter] || [activeFilter];
      if (features.notificationsIncludeTypes) {
        params.types = filtered;
      } else {
        params.exclude_types = excludeTypesFromFilter(filtered);
      }
    }

    if (!maxId && notifications.items.length > 0) {
      params.since_id = notifications.items[0]?.page_max_id;
    }

    dispatch(expandNotificationsRequest());

    return getClient(state).groupedNotifications.getGroupedNotifications(params, { signal: abortExpandNotifications.signal }).then(({ items: { accounts, statuses, notification_groups }, next }) => {
      dispatch(importEntities({
        accounts,
        statuses,
      }));

      dispatch(expandNotificationsSuccess(notification_groups, next));
      fetchRelatedRelationships(dispatch, notification_groups);
      done();
    }).catch(error => {
      dispatch(expandNotificationsFail(error));
      done();
    });
  };

const expandNotificationsRequest = () => ({ type: NOTIFICATIONS_EXPAND_REQUEST });

const expandNotificationsSuccess = (notifications: Array<NotificationGroup>, next: (() => Promise<PaginatedResponse<GroupedNotificationsResults, false>>) | null) => ({
  type: NOTIFICATIONS_EXPAND_SUCCESS,
  notifications,
  next,
});

const expandNotificationsFail = (error: unknown) => ({
  type: NOTIFICATIONS_EXPAND_FAIL,
  error,
});

interface SetFilterAction {
  type: typeof NOTIFICATIONS_FILTER_SET;
}

const setFilter = (filterType: FilterType, abort?: boolean) =>
  (dispatch: AppDispatch) => {
    const settingsStore = useSettingsStore.getState();
    const activeFilter = settingsStore.settings.notifications.quickFilter.active as FilterType;

    settingsStore.changeSetting(['notifications', 'quickFilter', 'active'], filterType);

    dispatch(expandNotifications(undefined, undefined, abort));
    if (activeFilter !== filterType) dispatch(saveSettings());

    return dispatch<SetFilterAction>({ type: NOTIFICATIONS_FILTER_SET });
  };

type NotificationsAction =
  | NotificationsUpdateAction
  | NotificationsUpdateNoopAction
  | ReturnType<typeof expandNotificationsRequest>
  | ReturnType<typeof expandNotificationsSuccess>
  | ReturnType<typeof expandNotificationsFail>
  | SetFilterAction;

export {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_UPDATE_NOOP,
  NOTIFICATIONS_EXPAND_REQUEST,
  NOTIFICATIONS_EXPAND_SUCCESS,
  NOTIFICATIONS_EXPAND_FAIL,
  NOTIFICATIONS_FILTER_SET,
  MAX_QUEUED_NOTIFICATIONS,
  type FilterType,
  updateNotifications,
  updateNotificationsQueue,
  expandNotifications,
  setFilter,
  type NotificationsAction,
};
