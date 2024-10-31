import * as v from 'valibot';

import { statusSchema } from './status';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Context/}
 */
const contextSchema = v.object({
  ancestors: v.array(statusSchema),
  descendants: v.array(statusSchema),
});

type Context = v.InferOutput<typeof contextSchema>;

export { contextSchema, type Context };
