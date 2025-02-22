import * as v from 'valibot';

/**
 * @category Admin schemas
 * @see {@link https://docs.joinmastodon.org/entities/Admin_CanonicalEmailBlock/}
 */
const adminCanonicalEmailBlockSchema = v.object({
  id: v.string(),
  canonical_email_hash: v.string(),
});

/**
 * @category Admin entity types
 */
type AdminCanonicalEmailBlock = v.InferOutput<typeof adminCanonicalEmailBlockSchema>;

export {
  adminCanonicalEmailBlockSchema,
  type AdminCanonicalEmailBlock,
};
