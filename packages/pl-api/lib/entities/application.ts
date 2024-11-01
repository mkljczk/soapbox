import * as v from 'valibot';

import { filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Application/}
 */
const applicationSchema = v.pipe(v.any(), v.transform((application) => ({
  redirect_uris: [application.redirect_uri],
  ...application,
})), v.object({
  name: v.fallback(v.string(), ''),
  website: v.fallback(v.optional(v.string()), undefined),
  client_id: v.fallback(v.optional(v.string()), undefined),
  client_secret: v.fallback(v.optional(v.string()), undefined),
  client_secret_expires_at: v.fallback(v.optional(v.string()), undefined),
  redirect_uris: filteredArray(v.string()),

  id: v.fallback(v.optional(v.string()), undefined),

  /** @deprecated */
  redirect_uri: v.fallback(v.optional(v.string()), undefined),
  /** @deprecated */
  vapid_key: v.fallback(v.optional(v.string()), undefined),
}));

type Application = v.InferOutput<typeof applicationSchema>;

export { applicationSchema, type Application };
