import pick from 'lodash.pick';
import * as v from 'valibot';

import { type Account, accountSchema } from './account';
import { customEmojiSchema } from './custom-emoji';
import { emojiReactionSchema } from './emoji-reaction';
import { filterResultSchema } from './filter-result';
import { groupSchema } from './group';
import { interactionPolicySchema } from './interaction-policy';
import { mediaAttachmentSchema } from './media-attachment';
import { mentionSchema } from './mention';
import { pollSchema } from './poll';
import { previewCardSchema } from './preview-card';
import { tagSchema } from './tag';
import { translationSchema } from './translation';
import { datetimeSchema, filteredArray } from './utils';

const statusEventSchema = v.object({
  name: v.fallback(v.string(), ''),
  start_time: v.fallback(v.nullable(datetimeSchema), null),
  end_time: v.fallback(v.nullable(datetimeSchema), null),
  join_mode: v.fallback(v.nullable(v.picklist(['free', 'restricted', 'invite', 'external'])), null),
  participants_count: v.fallback(v.number(), 0),
  location: v.fallback(v.nullable(v.object({
    name: v.fallback(v.string(), ''),
    url: v.fallback(v.pipe(v.string(), v.url()), ''),
    latitude: v.fallback(v.number(), 0),
    longitude: v.fallback(v.number(), 0),
    street: v.fallback(v.string(), ''),
    postal_code: v.fallback(v.string(), ''),
    locality: v.fallback(v.string(), ''),
    region: v.fallback(v.string(), ''),
    country: v.fallback(v.string(), ''),
  })), null),
  join_state: v.fallback(v.nullable(v.picklist(['pending', 'reject', 'accept'])), null),
});

/** @see {@link https://docs.joinmastodon.org/entities/Status/} */
const baseStatusSchema = v.object({
  id: v.string(),
  uri: v.fallback(v.pipe(v.string(), v.url()), ''),
  created_at: v.fallback(datetimeSchema, new Date().toISOString()),
  account: accountSchema,
  content: v.fallback(v.pipe(v.string(), v.transform((note => note === '<p></p>' ? '' : note))), ''),
  visibility: v.fallback(v.string(), 'public'),
  sensitive: v.pipe(v.unknown(), v.transform(Boolean)),
  spoiler_text: v.fallback(v.string(), ''),
  media_attachments: filteredArray(mediaAttachmentSchema),
  application: v.fallback(v.nullable(v.object({
    name: v.string(),
    website: v.fallback(v.nullable(v.pipe(v.string(), v.url())), null),
  })), null),
  mentions: filteredArray(mentionSchema),
  tags: filteredArray(tagSchema),
  emojis: filteredArray(customEmojiSchema),
  reblogs_count: v.fallback(v.number(), 0),
  favourites_count: v.fallback(v.number(), 0),
  replies_count: v.fallback(v.number(), 0),
  url: v.fallback(v.pipe(v.string(), v.url()), ''),
  in_reply_to_id: v.fallback(v.nullable(v.string()), null),
  in_reply_to_account_id: v.fallback(v.nullable(v.string()), null),
  poll: v.fallback(v.nullable(pollSchema), null),
  card: v.fallback(v.nullable(previewCardSchema), null),
  language: v.fallback(v.nullable(v.string()), null),
  text: v.fallback(v.nullable(v.string()), null),
  edited_at: v.fallback(v.nullable(datetimeSchema), null),
  favourited: v.pipe(v.unknown(), v.transform(Boolean)),
  reblogged: v.pipe(v.unknown(), v.transform(Boolean)),
  muted: v.pipe(v.unknown(), v.transform(Boolean)),
  bookmarked: v.pipe(v.unknown(), v.transform(Boolean)),
  pinned: v.pipe(v.unknown(), v.transform(Boolean)),
  filtered: filteredArray(filterResultSchema),
  approval_status: v.fallback(v.nullable(v.picklist(['pending', 'approval', 'rejected'])), null),
  group: v.fallback(v.nullable(groupSchema), null),
  scheduled_at: v.fallback(v.null(), null),

  quote_id: v.fallback(v.nullable(v.string()), null),
  local: v.fallback(v.optional(v.boolean()), undefined),
  conversation_id: v.fallback(v.optional(v.string()), undefined),
  direct_conversation_id: v.fallback(v.optional(v.string()), undefined),
  in_reply_to_account_acct: v.fallback(v.optional(v.string()), undefined),
  expires_at: v.fallback(v.optional(datetimeSchema), undefined),
  thread_muted: v.fallback(v.optional(v.boolean()), undefined),
  emoji_reactions: filteredArray(emojiReactionSchema),
  parent_visible: v.fallback(v.optional(v.boolean()), undefined),
  pinned_at: v.fallback(v.nullable(datetimeSchema), null),
  quote_visible: v.fallback(v.optional(v.boolean()), undefined),
  quote_url: v.fallback(v.optional(v.string()), undefined),
  quotes_count: v.fallback(v.number(), 0),
  bookmark_folder: v.fallback(v.nullable(v.string()), null),

  event: v.fallback(v.nullable(statusEventSchema), null),
  translation: v.fallback(v.union([v.nullable(translationSchema), v.literal(false)]), null),

  content_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
  text_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
  spoiler_text_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),

  dislikes_count: v.fallback(v.number(), 0),
  disliked: v.fallback(v.pipe(v.unknown(), v.transform(Boolean)), false),

  interaction_policy: interactionPolicySchema,
});

const preprocess = (status: any) => {
  if (!status) return null;
  status = {
    // @ts-ignore
    ...(pick(status.pleroma || {}, [
      'quote',
      'quote_id',
      'local',
      'conversation_id',
      'direct_conversation_id',
      'in_reply_to_account_acct',
      'expires_at',
      'thread_muted',
      'emoji_reactions',
      'parent_visible',
      'pinned_at',
      'quotes_count',
      'bookmark_folder',

      'event',
      'translation',
    ])),
    ...(pick(status.friendica || {}, [
      'dislikes_count',
      'disliked',
    ])),
    ...status,
  };

  return status;
};

/**
 * @category Schemas
 */
const statusSchema: v.BaseSchema<any, Status, v.BaseIssue<unknown>> = v.pipe(v.any(), v.transform(preprocess), v.object({
  ...baseStatusSchema.entries,
  reblog: v.fallback(v.nullable(v.lazy(() => statusSchema)), null),

  quote: v.fallback(v.nullable(v.lazy(() => statusSchema)), null),
})) as any;

/**
 * @category Schemas
 */
const statusWithoutAccountSchema = v.pipe(v.any(), v.transform(preprocess), v.object({
  ...(v.omit(baseStatusSchema, ['account']).entries),
  account: v.fallback(v.nullable(accountSchema), null),
  reblog: v.fallback(v.nullable(v.lazy(() => statusSchema)), null),

  quote: v.fallback(v.nullable(v.lazy(() => statusSchema)), null),
}));

type StatusWithoutAccount = Omit<v.InferOutput<typeof baseStatusSchema>, 'account'> & {
  account: Account | null;
  reblog: Status | null;
  quote: Status | null;
}

type Status = v.InferOutput<typeof baseStatusSchema> & {
  reblog: Status | null;
  quote: Status | null;
}

export { statusSchema, statusWithoutAccountSchema, type Status, type StatusWithoutAccount };
