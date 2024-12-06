import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Status/#Mention}
 */
const mentionSchema = v.pipe(
  v.object({
    id: v.string(),
    username: v.fallback(v.string(), ''),
    url: v.fallback(v.pipe(v.string(), v.url()), ''),
    acct: v.string(),
  }),
  v.transform((mention) => {
    if (!mention.username) {
      mention.username = mention.acct.split('@')[0];
    }

    return mention;
  }),
);

/**
 * @category Entity types
 */
type Mention = v.InferOutput<typeof mentionSchema>;

export { mentionSchema, type Mention };
