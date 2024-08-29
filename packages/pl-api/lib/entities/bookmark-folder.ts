import { z } from 'zod';

const bookmarkFolderSchema = z.object({
  id: z.coerce.string(),
  name: z.string().catch(''),
  emoji: z.string().nullable().catch(null),
  emoji_url: z.string().nullable().catch(null),
});

type BookmarkFolder = z.infer<typeof bookmarkFolderSchema>;

export { bookmarkFolderSchema, type BookmarkFolder };
