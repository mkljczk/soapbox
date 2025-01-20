import * as v from 'valibot';

import { mediaAttachmentSchema } from './media-attachment';
import { datetimeSchema, filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/ScheduledStatus/}
 */
const scheduledStatusSchema = v.object({
  id: v.string(),
  scheduled_at: datetimeSchema,
  params: v.object({
    text: v.fallback(v.nullable(v.string()), null),
    poll: v.fallback(v.nullable(v.object({
      options: v.array(v.string()),
      expires_in: v.pipe(v.unknown(), v.transform(String)),
      multiple: v.fallback(v.optional(v.boolean()), undefined),
      hide_totals: v.fallback(v.optional(v.boolean()), undefined),
    })), null),
    media_ids: v.fallback(v.nullable(v.string()), null),
    sensitive: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Boolean))), null),
    spoiler_text: v.fallback(v.nullable(v.string()), null),
    visibility: v.fallback(v.string(), 'public'),
    in_reply_to_id: v.fallback(v.nullable(v.string()), null),
    language: v.fallback(v.nullable(v.string()), null),
    application_id: v.fallback(v.nullable(v.pipe(v.number(), v.integer())), null),
    scheduled_at: v.fallback(v.nullable(datetimeSchema), null),
    idempotency: v.fallback(v.nullable(v.string()), null),
    with_rate_limit: v.fallback(v.boolean(), false),

    expires_in: v.fallback(v.nullable(v.number()), null),
  }),
  media_attachments: filteredArray(mediaAttachmentSchema),
});

/**
 * @category Entity types
 */
type ScheduledStatus = v.InferOutput<typeof scheduledStatusSchema>;

export { scheduledStatusSchema, type ScheduledStatus };
