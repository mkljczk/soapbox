import * as v from 'valibot';

import { announcementReactionSchema } from './announcement-reaction';
import { customEmojiSchema } from './custom-emoji';
import { mentionSchema } from './mention';
import { tagSchema } from './tag';
import { datetimeSchema, filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/announcement/}
 */
const announcementSchema = v.object({
  id: v.string(),
  content: v.fallback(v.string(), ''),
  starts_at: v.fallback(v.nullable(datetimeSchema), null),
  ends_at: v.fallback(v.nullable(datetimeSchema), null),
  all_day: v.fallback(v.boolean(), false),
  read: v.fallback(v.boolean(), false),
  published_at: v.fallback(datetimeSchema, new Date().toISOString()),
  reactions: filteredArray(announcementReactionSchema),
  statuses: v.pipe(
    v.any(),
    v.transform((statuses: any) => Array.isArray(statuses)
      ? Object.fromEntries(statuses.map((status: any) => [status.url, status.account?.acct]) || [])
      : statuses),
    v.record(v.string(), v.string()),
  ),
  mentions: filteredArray(mentionSchema),
  tags: filteredArray(tagSchema),
  emojis: filteredArray(customEmojiSchema),
  updated_at: v.fallback(datetimeSchema, new Date().toISOString()),
});

type Announcement = v.InferOutput<typeof announcementSchema>;

export { announcementSchema, type Announcement };
