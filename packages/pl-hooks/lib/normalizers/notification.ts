import omit from 'lodash/omit';

import type { AccountWarning, Account as BaseAccount, Notification as BaseNotification, RelationshipSeveranceEvent } from 'pl-api';

type DeduplicatedNotification = BaseNotification & {
  accounts: Array<BaseAccount>;
  duplicate?: boolean;
}

const STATUS_NOTIFICATION_TYPES = [
  'mention',
  'status',
  'reblog',
  'favourite',
  'poll',
  'update',
  'emoji_reaction',
  'event_reminder',
  'participation_accepted',
  'participation_request',
];

const getNotificationStatus = (n: Pick<BaseNotification, 'type'>) => {
  if (STATUS_NOTIFICATION_TYPES.includes(n.type))
    // @ts-ignore
    return n.status;
  return null;
};

const deduplicateNotifications = (notifications: Array<BaseNotification>): Array<DeduplicatedNotification> => {
  const deduplicatedNotifications: DeduplicatedNotification[] = [];

  for (const notification of notifications) {
    if (STATUS_NOTIFICATION_TYPES.includes(notification.type)) {
      const existingNotification = deduplicatedNotifications
        .find(deduplicated =>
          deduplicated.type === notification.type
          && ((notification.type === 'emoji_reaction' && deduplicated.type === 'emoji_reaction') ? notification.emoji === deduplicated.emoji : true)
          && getNotificationStatus(deduplicated)?.id === getNotificationStatus(notification)?.id,
        );

      if (existingNotification) {
        existingNotification.accounts.push(notification.account);
        deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: true });
      } else {
        deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: false });
      }
    } else {
      deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: false });
    }
  }

  return deduplicatedNotifications;
};

const normalizeNotification = (notification: BaseNotification | DeduplicatedNotification) => {
  // @ts-ignore
  const minifiedNotification: {
    duplicate: boolean;
    account_id: string;
    account_ids: string[];
    created_at: string;
    id: string;
    group_key: string;
  } & (
    | { type: 'follow' | 'follow_request' | 'admin.sign_up' | 'bite' }
    | {
      type: 'mention';
      subtype?: 'reply';
      status_id: string;
    }
    | {
      type: 'status' | 'reblog' | 'favourite' | 'poll' | 'update' | 'event_reminder';
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
    duplicate: false,
    ...omit(notification, ['account', 'accounts', 'status', 'target', 'chat_message']),
    account_id: notification.account.id,
    account_ids: ('accounts' in notification) ? notification.accounts.map(({ id }) => id) : [notification.account.id],
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

type NormalizedNotification = ReturnType<typeof normalizeNotification>;

export { deduplicateNotifications, getNotificationStatus, normalizeNotification, type DeduplicatedNotification, type NormalizedNotification };
