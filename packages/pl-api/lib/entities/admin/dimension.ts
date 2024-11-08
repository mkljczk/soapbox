import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Dimension/} */
const adminDimensionSchema = v.object({
  key: v.string(),
  data: v.object({
    key: v.string(),
    human_key: v.string(),
    value: v.string(),
    unit: v.fallback(v.optional(v.string()), undefined),
    human_value: v.fallback(v.optional(v.string()), undefined),
  }),
});

type AdminDimension = v.InferOutput<typeof adminDimensionSchema>;

export {
  adminDimensionSchema,
  type AdminDimension,
};
