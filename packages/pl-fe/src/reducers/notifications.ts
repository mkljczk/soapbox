import { Record as ImmutableRecord, OrderedMap as ImmutableOrderedMap } from 'immutable';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
  type AccountsAction,
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
  NOTIFICATIONS_MARK_READ_REQUEST,
} from '../actions/notifications';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { Notification as BaseNotification, Markers, NotificationGroup, PaginatedResponse, Relationship } from 'pl-api';
import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  items: ImmutableOrderedMap<string, NotificationGroup>(),
  hasMore: true,
  top: false,
  unread: 0,
  isLoading: false,
  lastRead: -1 as string | -1,
});

type State = ReturnType<typeof ReducerRecord>;

const parseId = (id: string | number) => parseInt(id as string, 10);

// For sorting the notifications
const comparator = (a: Pick<NotificationGroup, 'most_recent_notification_id'>, b: Pick<NotificationGroup, 'most_recent_notification_id'>) => {
  const parse = (m: Pick<NotificationGroup, 'most_recent_notification_id'>) => parseId(m.most_recent_notification_id);
  if (parse(a) < parse(b)) return 1;
  if (parse(a) > parse(b)) return -1;
  return 0;
};

// Count how many notifications appear after the given ID (for unread count)
const countFuture = (notifications: ImmutableOrderedMap<string, NotificationGroup>, lastId: string | number) =>
  notifications.reduce((acc, notification) => {
    if (parseId(notification.group_key) > parseId(lastId)) {
      return acc + 1;
    } else {
      return acc;
    }
  }, 0);

const importNotification = (state: State, notification: NotificationGroup) => {
  const top = state.top;

  if (!top) state = state.update('unread', unread => unread + 1);

  return state.update('items', map => map.set(notification.group_key, notification).sort(comparator));
};

const expandNormalizedNotifications = (state: State, notifications: NotificationGroup[], next: (() => Promise<PaginatedResponse<BaseNotification>>) | null) => {
  const items = ImmutableOrderedMap(notifications.map(n => [n.group_key, n]));

  return state.withMutations(mutable => {
    mutable.update('items', map => map.merge(items).sort(comparator));

    if (!next) mutable.set('hasMore', false);
    mutable.set('isLoading', false);
  });
};

const filterNotifications = (state: State, relationship: Relationship) =>
  state.update('items', map => map.filterNot(item => item !== null && item.sample_account_ids.includes(relationship.id)));

const filterNotificationIds = (state: State, accountIds: Array<string>, type?: string) => {
  const helper = (list: ImmutableOrderedMap<string, NotificationGroup>) => list.filterNot(item => item !== null && accountIds.includes(item.sample_account_ids[0]) && (type === undefined || type === item.type));
  return state.update('items', helper);
};

const updateTop = (state: State, top: boolean) => {
  if (top) state = state.set('unread', 0);
  return state.set('top', top);
};

const deleteByStatus = (state: State, statusId: string) =>
  // @ts-ignore
  state.update('items', map => map.filterNot(item => item !== null && item.status === statusId));

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

const notifications = (state: State = ReducerRecord(), action: AccountsAction | AnyAction | TimelineAction) => {
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

export { notifications as default };
