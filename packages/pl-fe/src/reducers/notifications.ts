import { create } from 'mutative';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  type AccountsAction,
} from '../actions/accounts';
import {
  MARKER_FETCH_SUCCESS,
  MARKER_SAVE_SUCCESS,
  type MarkersAction,
} from '../actions/markers';
import {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_EXPAND_SUCCESS,
  NOTIFICATIONS_EXPAND_REQUEST,
  NOTIFICATIONS_EXPAND_FAIL,
  NOTIFICATIONS_FILTER_SET,
  NOTIFICATIONS_SCROLL_TOP,
  type NotificationsAction,
} from '../actions/notifications';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { GroupedNotificationsResults, Markers, NotificationGroup, PaginatedResponse, Relationship } from 'pl-api';

interface State {
  items: Array<NotificationGroup>;
  hasMore: boolean;
  top: boolean;
  unread: number;
  isLoading: boolean;
  lastRead: string | -1;
}

const initialState: State = {
  items: [],
  hasMore: true,
  top: false,
  unread: 0,
  isLoading: false,
  lastRead: -1,
};

const parseId = (id: string | number) => parseInt(id as string, 10);

const filterUnique = (notification: NotificationGroup, index: number, notifications: Array<NotificationGroup>) =>
  notifications.findIndex(({ group_key }) => group_key === notification.group_key) === index;

// For sorting the notifications
const comparator = (a: Pick<NotificationGroup, 'most_recent_notification_id'>, b: Pick<NotificationGroup, 'most_recent_notification_id'>) => {
  const parse = (m: Pick<NotificationGroup, 'most_recent_notification_id'>) => parseId(m.most_recent_notification_id);
  if (parse(a) < parse(b)) return 1;
  if (parse(a) > parse(b)) return -1;
  return 0;
};

// Count how many notifications appear after the given ID (for unread count)
const countFuture = (notifications: Array<NotificationGroup>, lastId: string | number) =>
  notifications.reduce((acc, notification) => {
    if (parseId(notification.group_key) > parseId(lastId)) {
      return acc + 1;
    } else {
      return acc;
    }
  }, 0);

const importNotification = (state: State, notification: NotificationGroup) =>
  create(state, (draft) => {
    const top = draft.top;
    if (!top) draft.unread += 1;

    draft.items = [notification, ...draft.items].toSorted(comparator).filter(filterUnique);
  });

const expandNormalizedNotifications = (state: State, notifications: NotificationGroup[], next: (() => Promise<PaginatedResponse<GroupedNotificationsResults, false>>) | null) =>
  create(state, (draft) => {
    draft.items = [...notifications, ...draft.items].toSorted(comparator).filter(filterUnique);

    if (!next) draft.hasMore = false;
    draft.isLoading = false;
  });

const filterNotifications = (state: State, relationship: Relationship) =>
  create(state, (draft) => {
    draft.items = draft.items.filter(item => !item.sample_account_ids.includes(relationship.id));
  });

// const filterNotificationIds = (state: State, accountIds: Array<string>, type?: string) =>
// create(state, (draft) => {
//   const helper = (list: Array<NotificationGroup>) => list.filter(item => !(accountIds.includes(item.sample_account_ids[0]) && (type === undefined || type === item.type)));
//   draft.items = helper(draft.items);
// });

const updateTop = (state: State, top: boolean) =>
  create(state, (draft) => {
    if (top) draft.unread = 0;
    draft.top = top;
  });

const deleteByStatus = (state: State, statusId: string) =>
  create(state, (draft) => {
    // @ts-ignore
    draft.items = draft.items.filterNot(item => item !== null && item.status_id === statusId);
  });

const importMarker = (state: State, marker: Markers) => {
  const lastReadId = marker.notifications.last_read_id || -1 as string | -1;

  if (!lastReadId) {
    return state;
  }

  return create(state, (draft) => {
    const notifications = draft.items;
    const unread = countFuture(notifications, lastReadId);

    draft.unread = unread;
    draft.lastRead = lastReadId;
  });
};

const notifications = (state: State = initialState, action: AccountsAction | MarkersAction | NotificationsAction | TimelineAction): State => {
  switch (action.type) {
    case NOTIFICATIONS_EXPAND_REQUEST:
      return create(state, (draft) => {
        draft.isLoading = true;
      });
    case NOTIFICATIONS_EXPAND_FAIL:
      if ((action.error as any)?.message === 'canceled') return state;
      return create(state, (draft) => {
        draft.isLoading = false;
      });
    case NOTIFICATIONS_FILTER_SET:
      return create(state, (draft) => {
        draft.items = [];
        draft.hasMore = true;
      });
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
    // case FOLLOW_REQUEST_AUTHORIZE_SUCCESS:
    // case FOLLOW_REQUEST_REJECT_SUCCESS:
    //   return filterNotificationIds(state, [action.accountId], 'follow_request');
    case MARKER_FETCH_SUCCESS:
    case MARKER_SAVE_SUCCESS:
      return importMarker(state, action.marker);
    case TIMELINE_DELETE:
      return deleteByStatus(state, action.statusId);
    default:
      return state;
  }
};

export { notifications as default };
