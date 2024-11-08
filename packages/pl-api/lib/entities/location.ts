import * as v from 'valibot';

/**
 * @category Schemas
 */
const locationSchema = v.object({
  url: v.fallback(v.pipe(v.string(), v.url()), ''),
  description: v.fallback(v.string(), ''),
  country: v.fallback(v.string(), ''),
  locality: v.fallback(v.string(), ''),
  region: v.fallback(v.string(), ''),
  postal_code: v.fallback(v.string(), ''),
  street: v.fallback(v.string(), ''),
  origin_id: v.fallback(v.string(), ''),
  origin_provider: v.fallback(v.string(), ''),
  type: v.fallback(v.string(), ''),
  timezone: v.fallback(v.string(), ''),
  geom: v.fallback(v.nullable(v.object({
    coordinates: v.fallback(v.nullable(v.tuple([v.number(), v.number()])), null),
    srid: v.fallback(v.string(), ''),
  })), null),
});

type Location = v.InferOutput<typeof locationSchema>;

export { locationSchema, type Location };
