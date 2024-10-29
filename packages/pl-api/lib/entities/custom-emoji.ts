import * as v from 'valibot';

/**
 * Represents a custom emoji.
 *
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/CustomEmoji/}
 */
const customEmojiSchema = v.object({
  shortcode: v.string(),
  url: v.string(),
  static_url: v.fallback(v.string(), ''),
  visible_in_picker: v.fallback(v.boolean(), true),
  category: v.fallback(v.nullable(v.string()), null),
});

type CustomEmoji = v.InferOutput<typeof customEmojiSchema>;

export { customEmojiSchema, type CustomEmoji };
