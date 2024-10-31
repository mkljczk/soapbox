import * as v from 'valibot';

/**
 * @category Schemas
 */
const bookmarkFolderSchema = v.object({
  id: v.pipe(v.unknown(), v.transform(String)),
  name: v.fallback(v.string(), ''),
  emoji: v.fallback(v.nullable(v.string()), null),
  emoji_url: v.fallback(v.nullable(v.string()), null),
});

type BookmarkFolder = v.InferOutput<typeof bookmarkFolderSchema>;

export { bookmarkFolderSchema, type BookmarkFolder };
