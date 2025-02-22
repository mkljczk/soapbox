import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.joinmastodon.org/entities/Admin_Cohort/}
 */
const adminCohortSchema = v.object({
  period: datetimeSchema,
  frequency: v.picklist(['day', 'month']),
  data: v.array(v.object({
    date: datetimeSchema,
    rate: v.number(),
    value: v.pipe(v.number(), v.integer()),
  })),
});

/**
 * @category Admin entity types
 */
type AdminCohort = v.InferOutput<typeof adminCohortSchema>;

export {
  adminCohortSchema,
  type AdminCohort,
};
