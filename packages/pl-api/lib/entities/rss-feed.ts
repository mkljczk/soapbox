import * as v from 'valibot';

/**
 * @category Schemas
 */
const rssFeedSchema = v.object({
  id: v.string(),
  url: v.string(),
  title: v.fallback(v.nullable(v.string()), null),
  description: v.fallback(v.nullable(v.string()), null),
  image: v.fallback(v.nullable(v.string()), null),
});

/**
 * @category Entity types
 */
type RssFeed = v.InferOutput<typeof rssFeedSchema>;

export { rssFeedSchema, type RssFeed };
