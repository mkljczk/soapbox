import { Record as ImmutableRecord, OrderedMap as ImmutableOrderedMap } from 'immutable';
import omit from 'lodash/omit';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
} from '../actions/accounts';
import {
  MARKER_FETCH_SUCCESS,
  MARKER_SAVE_REQUEST,
  MARKER_SAVE_SUCCESS,
} from '../actions/markers';
import {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_EXPAND_SUCCESS,
  NOTIFICATIONS_EXPAND_REQUEST,
  NOTIFICATIONS_EXPAND_FAIL,
  NOTIFICATIONS_FILTER_SET,
  NOTIFICATIONS_CLEAR,
  NOTIFICATIONS_SCROLL_TOP,
  NOTIFICATIONS_UPDATE_QUEUE,
  NOTIFICATIONS_DEQUEUE,
  NOTIFICATIONS_MARK_READ_REQUEST,
  MAX_QUEUED_NOTIFICATIONS,
} from '../actions/notifications';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { AccountWarning, Notification as BaseNotification, Markers, PaginatedResponse, Relationship, RelationshipSeveranceEvent, Report } from 'pl-api';
import type { Notification } from 'pl-fe/normalizers/notification';
import type { AnyAction } from 'redux';

const QueuedNotificationRecord = ImmutableRecord({
  notification: {} as any as BaseNotification,
  intlMessages: {} as Record<string, string>,
  intlLocale: '',
});

const ReducerRecord = ImmutableRecord({
  items: ImmutableOrderedMap<string, MinifiedNotification>(),
  hasMore: true,
  top: false,
  unread: 0,
  isLoading: false,
  queuedNotifications: ImmutableOrderedMap<string, QueuedNotification>(), //max = MAX_QUEUED_NOTIFICATIONS
  totalQueuedNotificationsCount: 0, //used for queuedItems overflow for MAX_QUEUED_NOTIFICATIONS+
  lastRead: -1 as string | -1,
});

type State = ReturnType<typeof ReducerRecord>;
type QueuedNotification = ReturnType<typeof QueuedNotificationRecord>;

const parseId = (id: string | number) => parseInt(id as string, 10);

// For sorting the notifications
const comparator = (a: Pick<Notification, 'id'>, b: Pick<Notification, 'id'>) => {
  const parse = (m: Pick<Notification, 'id'>) => parseId(m.id);
  if (parse(a) < parse(b)) return 1;
  if (parse(a) > parse(b)) return -1;
  return 0;
};

const minifyNotification = (notification: Notification) => {
  // @ts-ignore
  const minifiedNotification: {
    duplicate: boolean;
    account_id: string;
    account_ids: string[];
    created_at: string;
    id: string;
  } & (
    | { type: 'follow' | 'follow_request' | 'admin.sign_up' | 'bite' }
    | {
      type: 'mention' | 'status' | 'reblog' | 'favourite' | 'poll' | 'update' | 'event_reminder';
      status_id: string;
     }
    | {
      type: 'admin.report';
      report: Report;
    }
    | {
      type: 'severed_relationships';
      relationship_severance_event: RelationshipSeveranceEvent;
    }
    | {
      type: 'moderation_warning';
      moderation_warning: AccountWarning;
    }
    | {
      type: 'move';
      target_id: string;
    }
    | {
      type: 'emoji_reaction';
      emoji: string;
      emoji_url: string | null;
      status_id: string;
    }
    | {
      type: 'chat_mention';
      chat_message_id: string;
    }
    | {
      type: 'participation_accepted' | 'participation_request';
      status_id: string;
      participation_message: string | null;
    }
  ) = {
    ...omit(notification, ['account', 'accounts']),
    created_at: notification.created_at,
    id: notification.id,
    type: notification.type,
  };

  // @ts-ignore
  if (notification.status) minifiedNotification.status_id = notification.status.id;
  // @ts-ignore
  if (notification.target) minifiedNotification.target_id = notification.target.id;
  // @ts-ignore
  if (notification.chat_message) minifiedNotification.chat_message_id = notification.chat_message.id;

  return minifiedNotification;
};

type MinifiedNotification = ReturnType<typeof minifyNotification>;

// Count how many notifications appear after the given ID (for unread count)
const countFuture = (notifications: ImmutableOrderedMap<string, MinifiedNotification>, lastId: string | number) =>
  notifications.reduce((acc, notification) => {
    if (!notification.duplicate && parseId(notification.id) > parseId(lastId)) {
      return acc + 1;
    } else {
      return acc;
    }
  }, 0);

const importNotification = (state: State, notification: Notification) => {
  const top = state.top;

  if (!top && !notification.duplicate) state = state.update('unread', unread => unread + 1);

  return state.update('items', map => {
    if (top && map.size > 40) {
      map = map.take(20);
    }

    return map.set(notification.id, minifyNotification(notification)).sort(comparator);
  });
};

const expandNormalizedNotifications = (state: State, notifications: Notification[], next: (() => Promise<PaginatedResponse<BaseNotification>>) | null) => {
  const items = ImmutableOrderedMap(notifications.map(minifyNotification).map(n => [n.id, n]));

  return state.withMutations(mutable => {
    mutable.update('items', map => map.merge(items).sort(comparator));

    if (!next) mutable.set('hasMore', false);
    mutable.set('isLoading', false);
  });
};

const filterNotifications = (state: State, relationship: Relationship) =>
  state.update('items', map => map.filterNot(item => item !== null && item.account_ids.includes(relationship.id)));

const filterNotificationIds = (state: State, accountIds: Array<string>, type?: string) => {
  const helper = (list: ImmutableOrderedMap<string, MinifiedNotification>) => list.filterNot(item => item !== null && accountIds.includes(item.account_ids[0]) && (type === undefined || type === item.type));
  return state.update('items', helper);
};

const updateTop = (state: State, top: boolean) => {
  if (top) state = state.set('unread', 0);
  return state.set('top', top);
};

const deleteByStatus = (state: State, statusId: string) =>
  // @ts-ignore
  state.update('items', map => map.filterNot(item => item !== null && item.status === statusId));

const updateNotificationsQueue = (state: State, notification: BaseNotification, intlMessages: Record<string, string>, intlLocale: string) => {
  const queuedNotifications = state.queuedNotifications;
  const listedNotifications = state.items;
  const totalQueuedNotificationsCount = state.totalQueuedNotificationsCount;

  const alreadyExists = queuedNotifications.has(notification.id) || listedNotifications.has(notification.id);
  if (alreadyExists) return state;

  const newQueuedNotifications = queuedNotifications;

  return state.withMutations(mutable => {
    if (totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS) {
      mutable.set('queuedNotifications', newQueuedNotifications.set(notification.id, QueuedNotificationRecord({
        notification,
        intlMessages,
        intlLocale,
      })));
    }
    mutable.set('totalQueuedNotificationsCount', totalQueuedNotificationsCount + 1);
  });
};

const importMarker = (state: State, marker: Markers) => {
  const lastReadId = marker.notifications.last_read_id || -1 as string | -1;

  if (!lastReadId) {
    return state;
  }

  return state.withMutations(state => {
    const notifications = state.items;
    const unread = countFuture(notifications, lastReadId);

    state.set('unread', unread);
    state.set('lastRead', lastReadId);
  });
};

const notifications = (state: State = ReducerRecord(), action: AnyAction | TimelineAction) => {
  switch (action.type) {
    case NOTIFICATIONS_EXPAND_REQUEST:
      return state.set('isLoading', true);
    case NOTIFICATIONS_EXPAND_FAIL:
      if (action.error?.message === 'canceled') return state;
      return state.set('isLoading', false);
    case NOTIFICATIONS_FILTER_SET:
      return state.set('items', ImmutableOrderedMap()).set('hasMore', true);
    case NOTIFICATIONS_SCROLL_TOP:
      return updateTop(state, action.top);
    case NOTIFICATIONS_UPDATE:
      return importNotification(state, action.notification);
    case NOTIFICATIONS_UPDATE_QUEUE:
      return updateNotificationsQueue(state, action.notification, action.intlMessages, action.intlLocale);
    case NOTIFICATIONS_DEQUEUE:
      return state.withMutations(mutable => {
        mutable.delete('queuedNotifications');
        mutable.set('totalQueuedNotificationsCount', 0);
      });
    case NOTIFICATIONS_EXPAND_SUCCESS:
      return expandNormalizedNotifications(state, action.notifications, action.next);
    case ACCOUNT_BLOCK_SUCCESS:
      return filterNotifications(state, action.relationship);
    case ACCOUNT_MUTE_SUCCESS:
      return action.relationship.muting_notifications ? filterNotifications(state, action.relationship) : state;
    case FOLLOW_REQUEST_AUTHORIZE_SUCCESS:
    case FOLLOW_REQUEST_REJECT_SUCCESS:
      return filterNotificationIds(state, [action.accountId], 'follow_request');
    case NOTIFICATIONS_CLEAR:
      return state.set('items', ImmutableOrderedMap()).set('hasMore', false);
    case NOTIFICATIONS_MARK_READ_REQUEST:
      return state.set('lastRead', action.lastRead);
    case MARKER_FETCH_SUCCESS:
    case MARKER_SAVE_REQUEST:
    case MARKER_SAVE_SUCCESS:
      return importMarker(state, action.marker);
    case TIMELINE_DELETE:
      return deleteByStatus(state, action.statusId);
    default:
      return state;
  }
};

export {
  notifications as default,
  type MinifiedNotification,
};
