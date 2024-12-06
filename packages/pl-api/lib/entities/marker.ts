import * as v from 'valibot';

import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Marker/}
 */
const markerSchema = v.pipe(
  v.any(),
  v.transform((marker: any) => marker ? ({
    unread_count: marker.pleroma?.unread_count,
    ...marker,
  }) : null),
  v.object({
    last_read_id: v.string(),
    version: v.pipe(v.number(), v.integer()),
    updated_at: datetimeSchema,
    unread_count: v.fallback(v.optional(v.pipe(v.number(), v.integer())), undefined),
  }),
);

/**
 * @category Entity types
 */
type Marker = v.InferOutput<typeof markerSchema>;

/**
 * @category Schemas
 */
const markersSchema = v.record(v.string(), markerSchema);

/**
 * @category Entity types
 */
type Markers = v.InferOutput<typeof markersSchema>;

export {
  markerSchema,
  markersSchema,
  type Marker,
  type Markers,
};
