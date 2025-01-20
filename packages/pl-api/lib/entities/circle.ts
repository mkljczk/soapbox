import * as v from 'valibot';

/**
 * @category Schemas
 */
const circleSchema = v.object({
  id: v.string(),
  title: v.string(),
});

/**
 * @category Entity types
 */
type Circle = v.InferOutput<typeof circleSchema>;

export { circleSchema, type Circle };
