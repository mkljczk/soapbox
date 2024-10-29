import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Relationship/}
 */
const relationshipSchema = v.object({
  blocked_by: v.fallback(v.boolean(), false),
  blocking: v.fallback(v.boolean(), false),
  domain_blocking: v.fallback(v.boolean(), false),
  endorsed: v.fallback(v.boolean(), false),
  followed_by: v.fallback(v.boolean(), false),
  following: v.fallback(v.boolean(), false),
  id: v.string(),
  muting: v.fallback(v.boolean(), false),
  muting_notifications: v.fallback(v.boolean(), false),
  note: v.fallback(v.string(), ''),
  notifying: v.fallback(v.boolean(), false),
  requested: v.fallback(v.boolean(), false),
  showing_reblogs: v.fallback(v.boolean(), false),
});

type Relationship = v.InferOutput<typeof relationshipSchema>;

export { relationshipSchema, type Relationship };
