import * as v from 'valibot';

import { type List, listSchema } from './list';

const baseAntennaSchema = v.object({
  id: v.string(),
  title: v.string(),
  with_media_only: v.boolean(),
  ignore_reblog: v.boolean(),
  stl: v.boolean(),
  ltl: v.boolean(),
  insert_feeds: v.boolean(),
  accounts_count: v.number(),
  domains_count: v.number(),
  tags_count: v.number(),
  keywords_count: v.number(),
  favourite: v.boolean(),
});

/**
 * @category Schemas
 */
const antennaSchema: v.BaseSchema<any, Antenna, v.BaseIssue<unknown>> = v.object({
  ...baseAntennaSchema.entries,
  list: v.fallback(v.nullable(v.lazy(() => listSchema)), null),
});

/**
 * @category Entity types
 */
type Antenna = v.InferOutput<typeof baseAntennaSchema> & {
  list: List | null;
}

export { antennaSchema, type Antenna };
