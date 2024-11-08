import * as v from 'valibot';

import { accountSchema } from './account';
import { emojiSchema, filteredArray } from './utils';

const baseEmojiReactionSchema = v.object({
  count: v.fallback(v.nullable(v.number()), null),
  me: v.fallback(v.boolean(), false),
  name: emojiSchema,
  url: v.fallback(v.undefined(), undefined),
  static_url: v.fallback(v.undefined(), undefined),
  accounts: filteredArray(accountSchema),
  account_ids: v.fallback(filteredArray(v.string()), []),
});

const customEmojiReactionSchema = v.object({
  ...baseEmojiReactionSchema.entries,
  name: v.string(),
  url: v.pipe(v.string(), v.url()),
  static_url: v.pipe(v.string(), v.url()),
});

/**
 * Pleroma emoji reaction.
 *
 * @category Schemas
 * @see {@link https://docs.pleroma.social/backend/development/API/differences_in_mastoapi_responses/#statuses}
*/
const emojiReactionSchema = v.pipe(
  v.any(),
  v.transform((reaction: any) => reaction ? {
    static_url: reaction.url,
    account_ids: reaction.accounts?.map((account: any) => account?.id),
    ...reaction,
  } : null),
  v.union([baseEmojiReactionSchema, customEmojiReactionSchema]),
);

type EmojiReaction = v.InferOutput<typeof emojiReactionSchema>;

export { emojiReactionSchema, type EmojiReaction };
