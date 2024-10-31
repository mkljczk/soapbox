import { Record as ImmutableRecord, OrderedMap as ImmutableOrderedMap } from 'immutable';
import omit from 'lodash/omit';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
} from '../actions/accounts';
import {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_UPDATE_QUEUE,
  NOTIFICATIONS_DEQUEUE,
  MAX_QUEUED_NOTIFICATIONS,
} from '../actions/notifications';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { AccountWarning, Notification as BaseNotification, Relationship, RelationshipSeveranceEvent, Report } from 'pl-api';
import type { Notification } from 'pl-fe/normalizers/notification';
import type { AnyAction } from 'redux';

const QueuedNotificationRecord = ImmutableRecord({
  notification: {} as any as BaseNotification,
  intlMessages: {} as Record<string, string>,
  intlLocale: '',
});

const ReducerRecord = ImmutableRecord({
  items: ImmutableOrderedMap<string, MinifiedNotification>(),
  unread: 0,
  queuedNotifications: ImmutableOrderedMap<string, QueuedNotification>(), //max = MAX_QUEUED_NOTIFICATIONS
  totalQueuedNotificationsCount: 0, //used for queuedItems overflow for MAX_QUEUED_NOTIFICATIONS+
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

const importNotification = (state: State, notification: Notification) => {
  const top = false; // state.top;

  if (!top && !notification.duplicate) state = state.update('unread', unread => unread + 1);

  return state.update('items', map => {
    if (top && map.size > 40) {
      map = map.take(20);
    }

    return map.set(notification.id, minifyNotification(notification)).sort(comparator);
  });
};

const filterNotifications = (state: State, relationship: Relationship) =>
  state.update('items', map => map.filterNot(item => item !== null && item.account_ids.includes(relationship.id)));

const filterNotificationIds = (state: State, accountIds: Array<string>, type?: string) => {
  const helper = (list: ImmutableOrderedMap<string, MinifiedNotification>) => list.filterNot(item => item !== null && accountIds.includes(item.account_ids[0]) && (type === undefined || type === item.type));
  return state.update('items', helper);
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

const notifications = (state: State = ReducerRecord(), action: AnyAction | TimelineAction) => {
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

export {
  notifications as default,
  type MinifiedNotification,
};
