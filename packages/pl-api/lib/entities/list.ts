import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/List/}
 */
const listSchema = v.object({
  id: v.pipe(v.unknown(), v.transform(String)),
  title: v.string(),
  replies_policy: v.fallback(v.optional(v.string()), undefined),
  exclusive: v.fallback(v.optional(v.boolean()), undefined),
});

type List = v.InferOutput<typeof listSchema>;

export { listSchema, type List };
