import * as v from 'valibot';

import { tagSchema } from '../tag';

/** @see {@link https://docs.joinmastodon.org/entities/Tag/#admin} */
const adminTagSchema = v.object({
  ...tagSchema.entries,
  id: v.string(),
  trendable: v.boolean(),
  usable: v.boolean(),
  requires_review: v.boolean(),
});

type AdminTag = v.InferOutput<typeof adminTagSchema>;

export {
  adminTagSchema,
  type AdminTag,
};
