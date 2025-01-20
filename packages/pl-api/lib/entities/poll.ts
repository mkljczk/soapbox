import * as v from 'valibot';

import { customEmojiSchema } from './custom-emoji';
import { datetimeSchema, filteredArray } from './utils';

const pollOptionSchema = v.object({
  title: v.fallback(v.string(), ''),
  votes_count: v.fallback(v.number(), 0),

  title_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Poll/}
 */
const pollSchema = v.object({
  emojis: filteredArray(customEmojiSchema),
  expired: v.fallback(v.boolean(), false),
  expires_at: v.fallback(v.nullable(datetimeSchema), null),
  id: v.string(),
  multiple: v.fallback(v.boolean(), false),
  options: v.pipe(v.array(pollOptionSchema), v.minLength(2)),
  voters_count: v.fallback(v.number(), 0),
  votes_count: v.fallback(v.number(), 0),
  own_votes: v.fallback(v.nullable(v.pipe(v.array(v.number()), v.minLength(1))), null),
  voted: v.fallback(v.boolean(), false),

  non_anonymous: v.fallback(v.boolean(), false),
});

/**
 * @category Entity types
 */
type Poll = v.InferOutput<typeof pollSchema>;

/**
 * @category Entity types
 */
type PollOption = Poll['options'][number];

export { pollSchema, type Poll, type PollOption };
