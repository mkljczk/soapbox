import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Application/}
 */
const applicationSchema = v.object({
  name: v.fallback(v.string(), ''),
  website: v.fallback(v.optional(v.string()), undefined),
  client_id: v.fallback(v.optional(v.string()), undefined),
  client_secret: v.fallback(v.optional(v.string()), undefined),
  redirect_uri: v.fallback(v.optional(v.string()), undefined),

  id: v.fallback(v.optional(v.string()), undefined),

  /** @deprecated */
  vapid_key: v.fallback(v.optional(v.string()), undefined),
});

type Application = v.InferOutput<typeof applicationSchema>;

export { applicationSchema, type Application };
