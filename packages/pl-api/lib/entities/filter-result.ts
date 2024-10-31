import * as v from 'valibot';

import { filterSchema } from './filter';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/FilterResult/}
 */
const filterResultSchema = v.object({
  filter: filterSchema,
  keyword_matches: v.fallback(v.nullable(v.string()), null),
  status_matches: v.fallback(v.nullable(v.string()), null),
});

type FilterResult = v.InferOutput<typeof filterResultSchema>;

export { filterResultSchema, type FilterResult };
