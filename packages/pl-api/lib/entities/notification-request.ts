import * as v from 'valibot';

import { accountSchema } from './account';
import { statusSchema } from './status';
import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/NotificationRequest}
 */
const notificationRequestSchema = v.object({
  id: v.string(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  account: accountSchema,
  notifications_count: v.pipe(v.unknown(), v.transform(String)),
  last_status: v.fallback(v.optional(statusSchema), undefined),
});

/**
 * @category Entity types
 */
type NotificationRequest = v.InferOutput<typeof notificationRequestSchema>;

export { notificationRequestSchema, type NotificationRequest };
