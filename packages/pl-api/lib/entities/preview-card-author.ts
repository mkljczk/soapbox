import * as v from 'valibot';

import { accountSchema } from './account';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/PreviewCardAuthor/}
 */
const previewCardAuthorSchema = v.object({
  name: v.string(),
  url: v.pipe(v.string(), v.url()),
  account: v.fallback(v.nullable(accountSchema), null),
});

/**
 * @category Entity types
 */
type PreviewCardAuthor = v.InferOutput<typeof previewCardAuthorSchema>;

export { previewCardAuthorSchema, type PreviewCardAuthor };
