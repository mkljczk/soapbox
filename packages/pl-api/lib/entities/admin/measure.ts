import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Measure/} */
const adminMeasureSchema = v.object({
  key: v.string(),
  unit: v.fallback(v.nullable(v.string()), null),
  total: v.pipe(v.unknown(), v.transform(Number)),
  human_value: v.fallback(v.optional(v.string()), undefined),
  previous_total: v.fallback(v.optional(v.pipe(v.unknown(), v.transform(String))), undefined),
  data: v.array(v.object({
    date: datetimeSchema,
    value: v.pipe(v.unknown(), v.transform(String)),
  })),
});

type AdminMeasure = v.InferOutput<typeof adminMeasureSchema>;

export {
  adminMeasureSchema,
  type AdminMeasure,
};
