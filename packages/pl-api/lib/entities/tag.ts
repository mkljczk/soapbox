import * as v from 'valibot';

/**
 * @category Schemas
 */
const historySchema = v.array(v.object({
  day: v.pipe(v.unknown(), v.transform(Number)),
  accounts: v.pipe(v.unknown(), v.transform(Number)),
  uses: v.pipe(v.unknown(), v.transform(Number)),
}));

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/tag}
 */
const tagSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  url: v.fallback(v.pipe(v.string(), v.url()), ''),
  history: v.fallback(v.nullable(historySchema), null),
  following: v.fallback(v.optional(v.boolean()), undefined),
});

/**
 * @category Entity types
 */
type Tag = v.InferOutput<typeof tagSchema>;

export { historySchema, tagSchema, type Tag };
