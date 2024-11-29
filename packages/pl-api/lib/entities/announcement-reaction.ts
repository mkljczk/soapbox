import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/announcement/}
 */
const announcementReactionSchema = v.object({
  name: v.fallback(v.string(), ''),
  count: v.fallback(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
  me: v.fallback(v.boolean(), false),
  url: v.fallback(v.nullable(v.string()), null),
  static_url: v.fallback(v.nullable(v.string()), null),
  announcement_id: v.fallback(v.string(), ''),
});

/**
 * @category Entity types
 */
type AnnouncementReaction = v.InferOutput<typeof announcementReactionSchema>;

export { announcementReactionSchema, type AnnouncementReaction };
