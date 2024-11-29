import pick from 'lodash.pick';
import * as v from 'valibot';

import { accountSchema } from './account';
import { accountWarningSchema } from './account-warning';
import { chatMessageSchema } from './chat-message';
import { relationshipSeveranceEventSchema } from './relationship-severance-event';
import { reportSchema } from './report';
import { statusSchema } from './status';
import { datetimeSchema, filteredArray } from './utils';

const partialAccountWithAvatarSchema = v.object({
  id: v.string(),
  acct: v.string(),
  url: v.pipe(v.string(), v.url()),
  avatar: v.pipe(v.string(), v.url()),
  avatar_static: v.pipe(v.string(), v.url()),
  locked: v.boolean(),
  bot: v.boolean(),
});

const baseNotificationGroupSchema = v.object({
  group_key: v.string(),
  notifications_count: v.pipe(v.number(), v.integer()),
  most_recent_notification_id: v.pipe(v.unknown(), v.transform(String), v.string()),
  page_min_id: v.fallback(v.optional(v.string()), undefined),
  page_max_id: v.fallback(v.optional(v.string()), undefined),
  latest_page_notification_at: v.fallback(v.optional(datetimeSchema), undefined),
  sample_account_ids: v.array(v.string()),

  is_muted: v.fallback(v.optional(v.boolean()), undefined),
  is_seen: v.fallback(v.optional(v.boolean()), undefined),
});

const accountNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.picklist(['follow', 'follow_request', 'admin.sign_up', 'bite']),
});

const mentionNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.literal('mention'),
  subtype: v.fallback(v.nullable(v.picklist(['reply'])), null),
  status_id: v.string(),
});

const statusNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.picklist(['status', 'reblog', 'favourite', 'poll', 'update', 'event_reminder']),
  status_id: v.string(),
});

const reportNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.literal('admin.report'),
  report: reportSchema,
});

const severedRelationshipNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.literal('severed_relationships'),
  relationship_severance_event: relationshipSeveranceEventSchema,
});

const moderationWarningNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.literal('moderation_warning'),
  moderation_warning: accountWarningSchema,
});

const moveNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.literal('move'),
  target_id: v.string(),
});

const emojiReactionNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.literal('emoji_reaction'),
  emoji: v.string(),
  emoji_url: v.fallback(v.nullable(v.string()), null),
  status_id: v.string(),
});

const chatMentionNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.literal('chat_mention'),
  chat_message: chatMessageSchema,
});

const eventParticipationRequestNotificationGroupSchema = v.object({
  ...baseNotificationGroupSchema.entries,
  type: v.picklist(['participation_accepted', 'participation_request']),
  status_id: v.string(),
  participation_message: v.fallback(v.nullable(v.string()), null),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Notification/}
 * */
const notificationGroupSchema: v.BaseSchema<any, NotificationGroup, v.BaseIssue<unknown>> = v.pipe(
  v.any(),
  v.transform((notification: any) => ({
    group_key: `ungrouped-${notification.id}`,
    ...pick(notification.pleroma || {}, ['is_muted', 'is_seen']),
    ...notification,
    type: notification.type === 'pleroma:report'
      ? 'admin.report'
      : notification.type?.replace(/^pleroma:/, ''),
  })),
  v.variant('type', [
    accountNotificationGroupSchema,
    mentionNotificationGroupSchema,
    statusNotificationGroupSchema,
    reportNotificationGroupSchema,
    severedRelationshipNotificationGroupSchema,
    moderationWarningNotificationGroupSchema,
    moveNotificationGroupSchema,
    emojiReactionNotificationGroupSchema,
    chatMentionNotificationGroupSchema,
    eventParticipationRequestNotificationGroupSchema,
  ])) as any;

/**
 * @category Entity types
 */
type NotificationGroup = v.InferOutput<
  | typeof accountNotificationGroupSchema
  | typeof mentionNotificationGroupSchema
  | typeof statusNotificationGroupSchema
  | typeof reportNotificationGroupSchema
  | typeof severedRelationshipNotificationGroupSchema
  | typeof moderationWarningNotificationGroupSchema
  | typeof moveNotificationGroupSchema
  | typeof emojiReactionNotificationGroupSchema
  | typeof chatMentionNotificationGroupSchema
  | typeof eventParticipationRequestNotificationGroupSchema
  >;

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#GroupedNotificationsResults}
 */
const groupedNotificationsResultsSchema = v.object({
  accounts: filteredArray(accountSchema),
  partial_accounts: v.fallback(v.optional(v.array(partialAccountWithAvatarSchema)), undefined),
  statuses: filteredArray(statusSchema),
  notification_groups: filteredArray(notificationGroupSchema),
});

type GroupedNotificationsResults = v.InferOutput<typeof groupedNotificationsResultsSchema>;

export { notificationGroupSchema, groupedNotificationsResultsSchema, type NotificationGroup, type GroupedNotificationsResults };
