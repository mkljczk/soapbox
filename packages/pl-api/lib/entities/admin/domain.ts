import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 */
const adminDomainSchema = v.object({
  domain: v.fallback(v.string(), ''),
  id: v.pipe(v.unknown(), v.transform(String)),
  public: v.fallback(v.boolean(), false),
  resolves: v.fallback(v.boolean(), false),
  last_checked_at: v.fallback(v.nullable(datetimeSchema), null),
});

/**
 * @category Admin entity types
 */
type AdminDomain = v.InferOutput<typeof adminDomainSchema>

export { adminDomainSchema, type AdminDomain };
