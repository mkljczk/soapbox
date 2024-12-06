import * as v from 'valibot';

import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/RelationshipSeveranceEvent/}
 */
const relationshipSeveranceEventSchema = v.object({
  id: v.string(),
  type: v.picklist(['domain_block', 'user_domain_block', 'account_suspension']),
  purged: v.string(),
  relationships_count: v.fallback(v.optional(v.number()), undefined),
  created_at: datetimeSchema,
});

/**
 * @category Entity types
 */
type RelationshipSeveranceEvent = v.InferOutput<typeof relationshipSeveranceEventSchema>;

export { relationshipSeveranceEventSchema, type RelationshipSeveranceEvent };
