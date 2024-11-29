import * as v from 'valibot';

import { previewCardAuthorSchema } from './preview-card-author';
import { filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/PreviewCard/}
 */
const previewCardSchema = v.object({
  /** @deprecated */
  author_name: v.fallback(v.string(), ''),
  /** @deprecated */
  author_url: v.fallback(v.pipe(v.string(), v.url()), ''),
  authors: filteredArray(previewCardAuthorSchema),
  blurhash: v.fallback(v.nullable(v.string()), null),
  description: v.fallback(v.string(), ''),
  embed_url: v.fallback(v.pipe(v.string(), v.url()), ''),
  height: v.fallback(v.number(), 0),
  html: v.fallback(v.string(), ''),
  image: v.fallback(v.nullable(v.string()), null),
  image_description: v.fallback(v.string(), ''),
  provider_name: v.fallback(v.string(), ''),
  provider_url: v.fallback(v.pipe(v.string(), v.url()), ''),
  title: v.fallback(v.string(), ''),
  type: v.fallback(v.picklist(['link', 'photo', 'video', 'rich']), 'link'),
  url: v.pipe(v.string(), v.url()),
  width: v.fallback(v.number(), 0),
});

/**
 * @category Entity types
 */
type PreviewCard = v.InferOutput<typeof previewCardSchema>;

export { previewCardSchema, type PreviewCard };
