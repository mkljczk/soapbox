import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Token/}
 */
const tokenSchema = v.object({
  access_token: v.string(),
  token_type: v.string(),
  scope: v.string(),
  created_at: v.fallback(v.optional(v.number()), undefined),

  id: v.fallback(v.optional(v.pipe(v.unknown(), v.transform(String))), undefined),
  refresh_token: v.fallback(v.optional(v.string()), undefined),
  expires_in: v.fallback(v.optional(v.number()), undefined),
  me: v.fallback(v.optional(v.string()), undefined),
});

/**
 * @category Entity types
 */
type Token = v.InferOutput<typeof tokenSchema>;

export { tokenSchema, type Token };
