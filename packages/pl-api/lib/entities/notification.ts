import pick from 'lodash.pick';
import * as v from 'valibot';

import { accountSchema } from './account';
import { accountWarningSchema } from './account-warning';
import { chatMessageSchema } from './chat-message';
import { relationshipSeveranceEventSchema } from './relationship-severance-event';
import { reportSchema } from './report';
import { statusSchema } from './status';
import { datetimeSchema } from './utils';

const baseNotificationSchema = v.object({
  account: accountSchema,
  created_at: v.fallback(datetimeSchema, new Date().toISOString()),
  id: v.string(),
  group_key: v.string(),
  type: v.string(),

  is_muted: v.fallback(v.optional(v.boolean()), undefined),
  is_seen: v.fallback(v.optional(v.boolean()), undefined),
});

const accountNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.picklist(['follow', 'follow_request', 'admin.sign_up', 'bite']),
});

const mentionNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.literal('mention'),
  subtype: v.fallback(v.nullable(v.picklist(['reply'])), null),
  status: statusSchema,
});

const statusNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.picklist(['status', 'reblog', 'favourite', 'poll', 'update', 'event_reminder']),
  status: statusSchema,
});

const reportNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.literal('admin.report'),
  report: reportSchema,
});

const severedRelationshipNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.literal('severed_relationships'),
  relationship_severance_event: relationshipSeveranceEventSchema,
});

const moderationWarningNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.literal('moderation_warning'),
  moderation_warning: accountWarningSchema,
});

const moveNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.literal('move'),
  target: accountSchema,
});

const emojiReactionNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.literal('emoji_reaction'),
  emoji: v.string(),
  emoji_url: v.fallback(v.nullable(v.string()), null),
  status: statusSchema,
});

const chatMentionNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.literal('chat_mention'),
  chat_message: chatMessageSchema,
});

const eventParticipationRequestNotificationSchema = v.object({
  ...baseNotificationSchema.entries,
  type: v.picklist(['participation_accepted', 'participation_request']),
  status: statusSchema,
  participation_message: v.fallback(v.nullable(v.string()), null),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Notification/}
 * */
const notificationSchema: v.BaseSchema<any, Notification, v.BaseIssue<unknown>> = v.pipe(
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
    accountNotificationSchema,
    mentionNotificationSchema,
    statusNotificationSchema,
    reportNotificationSchema,
    severedRelationshipNotificationSchema,
    moderationWarningNotificationSchema,
    moveNotificationSchema,
    emojiReactionNotificationSchema,
    chatMentionNotificationSchema,
    eventParticipationRequestNotificationSchema,
  ])) as any;

/**
 * @category Entity types
 */
type Notification = v.InferOutput<
| typeof accountNotificationSchema
| typeof mentionNotificationSchema
| typeof statusNotificationSchema
| typeof reportNotificationSchema
| typeof severedRelationshipNotificationSchema
| typeof moderationWarningNotificationSchema
| typeof moveNotificationSchema
| typeof emojiReactionNotificationSchema
| typeof chatMentionNotificationSchema
| typeof eventParticipationRequestNotificationSchema
>;

export { notificationSchema, type Notification };
