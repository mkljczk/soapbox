import { Record as ImmutableRecord, OrderedMap as ImmutableOrderedMap } from 'immutable';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
  type AccountsAction,
} from '../actions/accounts';
import {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_UPDATE_QUEUE,
  NOTIFICATIONS_DEQUEUE,
  MAX_QUEUED_NOTIFICATIONS,
} from '../actions/notifications';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { Notification as BaseNotification, NotificationGroup, Relationship } from 'pl-api';
import type { AnyAction } from 'redux';

const QueuedNotificationRecord = ImmutableRecord({
  notification: {} as any as BaseNotification,
  intlMessages: {} as Record<string, string>,
  intlLocale: '',
});

const ReducerRecord = ImmutableRecord({
  items: ImmutableOrderedMap<string, NotificationGroup>(),
  unread: 0,
  queuedNotifications: ImmutableOrderedMap<string, QueuedNotification>(), //max = MAX_QUEUED_NOTIFICATIONS
  totalQueuedNotificationsCount: 0, //used for queuedItems overflow for MAX_QUEUED_NOTIFICATIONS+
});

type State = ReturnType<typeof ReducerRecord>;
type QueuedNotification = ReturnType<typeof QueuedNotificationRecord>;

const parseId = (id: string | number) => parseInt(id as string, 10);

// For sorting the notifications
const comparator = (a: Pick<NotificationGroup, 'group_key'>, b: Pick<NotificationGroup, 'group_key'>) => {
  const parse = (m: Pick<NotificationGroup, 'group_key'>) => parseId(m.group_key);
  if (parse(a) < parse(b)) return 1;
  if (parse(a) > parse(b)) return -1;
  return 0;
};

const importNotification = (state: State, notification: NotificationGroup) => {
  const top = false; // state.top;

  if (!top) state = state.update('unread', unread => unread + 1);

  return state.update('items', map => {
    if (top && map.size > 40) {
      map = map.take(20);
    }

    return map.set(notification.group_key, notification).sort(comparator);
  });
};

const filterNotifications = (state: State, relationship: Relationship) =>
  state.update('items', map => map.filterNot(item => item !== null && item.sample_account_ids.includes(relationship.id)));

const filterNotificationIds = (state: State, accountIds: Array<string>, type?: string) => {
  const helper = (list: ImmutableOrderedMap<string, NotificationGroup>) => list.filterNot(item => item !== null && accountIds.includes(item.sample_account_ids[0]) && (type === undefined || type === item.type));
  return state.update('items', helper);
};

const deleteByStatus = (state: State, statusId: string) =>
  // @ts-ignore
  state.update('items', map => map.filterNot(item => item !== null && item.status === statusId));

const updateNotificationsQueue = (state: State, notification: BaseNotification, intlMessages: Record<string, string>, intlLocale: string) => {
  const queuedNotifications = state.queuedNotifications;
  const listedNotifications = state.items;
  const totalQueuedNotificationsCount = state.totalQueuedNotificationsCount;

  const alreadyExists = queuedNotifications.has(notification.group_key) || listedNotifications.has(notification.group_key);
  if (alreadyExists) return state;

  const newQueuedNotifications = queuedNotifications;

  return state.withMutations(mutable => {
    if (totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS) {
      mutable.set('queuedNotifications', newQueuedNotifications.set(notification.group_key, QueuedNotificationRecord({
        notification,
        intlMessages,
        intlLocale,
      })));
    }
    mutable.set('totalQueuedNotificationsCount', totalQueuedNotificationsCount + 1);
  });
};

const notifications = (state: State = ReducerRecord(), action: AccountsAction | AnyAction | TimelineAction) => {
  switch (action.type) {
    case NOTIFICATIONS_UPDATE:
      return importNotification(state, action.notification);
    case NOTIFICATIONS_UPDATE_QUEUE:
      return updateNotificationsQueue(state, action.notification, action.intlMessages, action.intlLocale);
    case NOTIFICATIONS_DEQUEUE:
      return state.withMutations(mutable => {
        mutable.delete('queuedNotifications');
        mutable.set('totalQueuedNotificationsCount', 0);
      });
    case ACCOUNT_BLOCK_SUCCESS:
      return filterNotifications(state, action.relationship);
    case ACCOUNT_MUTE_SUCCESS:
      return action.relationship.muting_notifications ? filterNotifications(state, action.relationship) : state;
    case FOLLOW_REQUEST_AUTHORIZE_SUCCESS:
    case FOLLOW_REQUEST_REJECT_SUCCESS:
      return filterNotificationIds(state, [action.accountId], 'follow_request');
    case TIMELINE_DELETE:
      return deleteByStatus(state, action.statusId);
    default:
      return state;
  }
};

export { notifications as default };
