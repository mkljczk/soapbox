import * as v from 'valibot';

import { blurhashSchema } from './media-attachment';
import { historySchema } from './tag';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/PreviewCard/#trends-link}
 */
const trendsLinkSchema = v.pipe(
  v.any(),
  v.transform((link: any) => ({ ...link, id: link.url })),
  v.object({
    id: v.fallback(v.string(), ''),
    url: v.fallback(v.pipe(v.string(), v.url()), ''),
    title: v.fallback(v.string(), ''),
    description: v.fallback(v.string(), ''),
    type: v.fallback(v.picklist(['link', 'photo', 'video', 'rich']), 'link'),
    author_name: v.fallback(v.string(), ''),
    author_url: v.fallback(v.string(), ''),
    provider_name: v.fallback(v.string(), ''),
    provider_url: v.fallback(v.string(), ''),
    html: v.fallback(v.string(), ''),
    width: v.fallback(v.nullable(v.number()), null),
    height: v.fallback(v.nullable(v.number()), null),
    image: v.fallback(v.nullable(v.string()), null),
    image_description: v.fallback(v.nullable(v.string()), null),
    embed_url: v.fallback(v.string(), ''),
    blurhash: v.fallback(v.nullable(blurhashSchema), null),
    history: v.fallback(v.nullable(historySchema), null),
  }),
);

type TrendsLink = v.InferOutput<typeof trendsLinkSchema>;

export { trendsLinkSchema, type TrendsLink };
