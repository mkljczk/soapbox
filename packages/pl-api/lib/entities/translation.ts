import * as v from 'valibot';

import { filteredArray } from './utils';

const translationPollSchema = v.object({
  id: v.string(),
  options: v.array(v.object({
    title: v.string(),
  })),
});

const translationMediaAttachment = v.object({
  id: v.string(),
  description: v.fallback(v.string(), ''),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Translation/}
 */
const translationSchema = v.pipe(
  v.any(),
  v.transform((translation: any) => {
  /**
   * handle Akkoma
   * @see {@link https://akkoma.dev/AkkomaGang/akkoma/src/branch/develop/lib/pleroma/web/mastodon_api/controllers/status_controller.ex#L504}
   */
    if (translation?.text) return {
      content: translation.text,
      detected_source_language: translation.detected_language,
    };

    return translation;
  }),
  v.object({
    id: v.fallback(v.nullable(v.string()), null),
    content: v.fallback(v.string(), ''),
    spoiler_text: v.fallback(v.string(), ''),
    poll: v.fallback(v.optional(translationPollSchema), undefined),
    media_attachments: filteredArray(translationMediaAttachment),
    detected_source_language: v.string(),
    provider: v.fallback(v.nullable(v.string()), null),
  }),
);

type Translation = v.InferOutput<typeof translationSchema>;

export { translationSchema, type Translation };
