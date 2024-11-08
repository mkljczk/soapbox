import omit from 'lodash/omit';

import type { Notification as BaseNotification, NotificationGroup } from 'pl-api';

const normalizeNotification = (notification: BaseNotification): NotificationGroup => ({
  ...(omit(notification, ['account', 'status', 'target'])),
  group_key: notification.id,
  notifications_count: 1,
  most_recent_notification_id: notification.id,
  page_min_id: notification.id,
  page_max_id: notification.id,
  latest_page_notification_at: notification.created_at,
  sample_account_ids: [notification.account.id],
  // @ts-ignore
  status_id: notification.status?.id,
  // @ts-ignore
  target_id: notification.target?.id,
});

export { normalizeNotification };
