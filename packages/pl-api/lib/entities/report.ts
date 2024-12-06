import * as v from 'valibot';

import { accountSchema } from './account';
import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Report/}
 */
const reportSchema = v.object({
  id: v.string(),
  action_taken: v.fallback(v.optional(v.boolean()), undefined),
  action_taken_at: v.fallback(v.nullable(datetimeSchema), null),
  category: v.fallback(v.optional(v.string()), undefined),
  comment: v.fallback(v.optional(v.string()), undefined),
  forwarded: v.fallback(v.optional(v.boolean()), undefined),
  created_at: v.fallback(v.optional(datetimeSchema), undefined),
  status_ids: v.fallback(v.nullable(v.string()), null),
  rule_ids: v.fallback(v.nullable(v.string()), null),
  target_account: v.fallback(v.nullable(accountSchema), null),
});

/**
 * @category Entity types
 */
type Report = v.InferOutput<typeof reportSchema>;

export { reportSchema, type Report };
