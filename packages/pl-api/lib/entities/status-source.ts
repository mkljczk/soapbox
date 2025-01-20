import * as v from 'valibot';

import { locationSchema } from './location';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/StatusSource/}
 */
const statusSourceSchema = v.object({
  id: v.string(),
  text: v.fallback(v.string(), ''),
  spoiler_text: v.fallback(v.string(), ''),

  content_type: v.fallback(v.string(), 'text/plain'),
  location: v.fallback(v.nullable(locationSchema), null),

  text_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
  spoiler_text_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
});

/**
 * @category Entity types
 */
type StatusSource = v.InferOutput<typeof statusSourceSchema>;

export { statusSourceSchema, type StatusSource };
