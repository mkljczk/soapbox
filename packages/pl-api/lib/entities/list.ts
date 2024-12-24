import * as v from 'valibot';

import { antennaSchema } from './antenna';
import { filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/List/}
 */
const listSchema = v.object({
  id: v.pipe(v.unknown(), v.transform(String)),
  title: v.string(),
  replies_policy: v.fallback(v.optional(v.string()), undefined),
  exclusive: v.fallback(v.optional(v.boolean()), undefined),
  antennas: filteredArray(v.lazy(() => antennaSchema)),
  notify: v.fallback(v.optional(v.boolean()), undefined),
  favourite: v.fallback(v.optional(v.boolean()), undefined),
});

/**
 * @category Entity types
 */
type List = v.InferOutput<typeof listSchema>;

export { listSchema, type List };
