import * as v from 'valibot';

import { listSchema } from './list';

/**
 * @category Schemas
 */
const antennaSchema = v.object({
  id: v.string(),
  title: v.string(),
  with_media_only: v.boolean(),
  ignore_reblog: v.boolean(),
  stl: v.boolean(),
  ltl: v.boolean(),
  insert_feeds: v.boolean(),
  list: v.nullable(listSchema),
  accounts_count: v.number(),
  domains_count: v.number(),
  tags_count: v.number(),
  keywords_count: v.number(),
  favourite: v.boolean(),
});

/**
 * @category Entity types
 */
type Antenna = v.InferOutput<typeof antennaSchema>;

export { antennaSchema, type Antenna };
