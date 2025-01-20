import * as v from 'valibot';

import { announcementSchema } from './announcement';
import { announcementReactionSchema } from './announcement-reaction';
import { chatSchema } from './chat';
import { conversationSchema } from './conversation';
import { markersSchema } from './marker';
import { notificationSchema } from './notification';
import { statusSchema } from './status';

/**
 * @category Schemas
 */
const followRelationshipUpdateSchema = v.object({
  state: v.picklist(['follow_pending', 'follow_accept', 'follow_reject']),
  follower: v.object({
    id: v.string(),
    follower_count: v.fallback(v.nullable(v.number()), null),
    following_count: v.fallback(v.nullable(v.number()), null),
  }),
  following: v.object({
    id: v.string(),
    follower_count: v.fallback(v.nullable(v.number()), null),
    following_count: v.fallback(v.nullable(v.number()), null),
  }),
});

/**
 * @category Entity types
 */
type FollowRelationshipUpdate = v.InferOutput<typeof followRelationshipUpdateSchema>;

const baseStreamingEventSchema = v.object({
  stream: v.fallback(v.array(v.string()), []),
});

const statusStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.picklist(['update', 'status.update']),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), statusSchema),
});

const stringStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.picklist(['delete', 'announcement.delete']),
  payload: v.string(),
});

const notificationStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('notification'),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), notificationSchema),
});

const emptyStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('filters_changed'),
});

const conversationStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('conversation'),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), conversationSchema),
});

const announcementStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('announcement'),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), announcementSchema),
});

const announcementReactionStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('announcement.reaction'),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), announcementReactionSchema),
});

const chatUpdateStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('chat_update'),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), chatSchema),
});

const followRelationshipsUpdateStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('follow_relationships_update'),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), followRelationshipUpdateSchema),
});

const respondStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('respond'),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), v.object({
    type: v.string(),
    result: v.picklist(['success', 'ignored', 'error']),
  })),
});

const markerStreamingEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('marker'),
  payload: v.pipe(v.any(), v.transform((payload: any) => JSON.parse(payload)), markersSchema),
});

const notificationsMergedEventSchema = v.object({
  ...baseStreamingEventSchema.entries,
  event: v.literal('notifications_merged'),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/methods/streaming/#events}
 */
const streamingEventSchema: v.BaseSchema<any, StreamingEvent, v.BaseIssue<unknown>> = v.pipe(
  v.any(),
  v.transform((event: any) => ({
    ...event,
    event: event.event?.replace(/^pleroma:/, ''),
  })),
  v.variant('event', [
    statusStreamingEventSchema,
    stringStreamingEventSchema,
    notificationStreamingEventSchema,
    emptyStreamingEventSchema,
    conversationStreamingEventSchema,
    announcementStreamingEventSchema,
    announcementReactionStreamingEventSchema,
    chatUpdateStreamingEventSchema,
    followRelationshipsUpdateStreamingEventSchema,
    respondStreamingEventSchema,
    markerStreamingEventSchema,
    notificationsMergedEventSchema,
  ]),
) as any;

/**
 * @category Entity types
 */
type StreamingEvent = v.InferOutput<
| typeof statusStreamingEventSchema
| typeof stringStreamingEventSchema
| typeof notificationStreamingEventSchema
| typeof emptyStreamingEventSchema
| typeof conversationStreamingEventSchema
| typeof announcementStreamingEventSchema
| typeof announcementReactionStreamingEventSchema
| typeof chatUpdateStreamingEventSchema
| typeof followRelationshipsUpdateStreamingEventSchema
| typeof respondStreamingEventSchema
| typeof markerStreamingEventSchema
| typeof notificationsMergedEventSchema
>;

export {
  followRelationshipUpdateSchema,
  streamingEventSchema,
  type FollowRelationshipUpdate,
  type StreamingEvent,
};
