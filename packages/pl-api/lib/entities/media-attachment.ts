import { isBlurhashValid } from 'blurhash';
import * as v from 'valibot';

import { mimeSchema } from './utils';

/**
 * @category Schemas
 */
const blurhashSchema = v.pipe(v.string(), v.check(
  (value) => isBlurhashValid(value).result,
  'invalid blurhash', // .errorReason
));

const baseAttachmentSchema = v.object({
  id: v.string(),
  type: v.string(),
  url: v.fallback(v.pipe(v.string(), v.url()), ''),
  preview_url: v.fallback(v.pipe(v.string(), v.url()), ''),
  remote_url: v.fallback(v.nullable(v.pipe(v.string(), v.url())), null),
  description: v.fallback(v.string(), ''),
  blurhash: v.fallback(v.nullable(blurhashSchema), null),

  mime_type: v.fallback(v.nullable(mimeSchema), null),
});

const imageMetaSchema = v.object({
  width: v.number(),
  height: v.number(),
  size: v.fallback(v.nullable(v.pipe(v.string(), v.regex(/\d+x\d+$/))), null),
  aspect: v.fallback(v.nullable(v.number()), null),
});

const imageAttachmentSchema = v.object({
  ...baseAttachmentSchema.entries,
  type: v.literal('image'),
  meta: v.fallback(v.object({
    original: v.fallback(v.optional(imageMetaSchema), undefined),
    small: v.fallback(v.optional(imageMetaSchema), undefined),
    focus: v.fallback(v.optional(v.object({
      x: v.pipe(v.number(), v.minValue(-1), v.maxValue(1)),
      y: v.pipe(v.number(), v.minValue(-1), v.maxValue(1)),
    })), undefined),
  }), {}),
});

const videoAttachmentSchema = v.object({
  ...baseAttachmentSchema.entries,
  type: v.literal('video'),
  meta: v.fallback(v.object({
    duration: v.fallback(v.optional(v.number()), undefined),
    original: v.fallback(v.optional(v.object({
      ...imageMetaSchema.entries,
      frame_rate: v.fallback(v.nullable(v.pipe(v.string(), v.regex(/\d+\/\d+$/))), null),
      duration: v.fallback(v.nullable(v.pipe(v.number(), v.minValue(0))), null),
    })), undefined),
    small: v.fallback(v.optional(imageMetaSchema), undefined),
    // WIP: add rest
  }), {}),
});

const gifvAttachmentSchema = v.object({
  ...baseAttachmentSchema.entries,
  type: v.literal('gifv'),
  meta: v.fallback(v.object({
    duration: v.fallback(v.optional(v.number()), undefined),
    original: v.fallback(v.optional(imageMetaSchema), undefined),
  }), {}),
});

const audioAttachmentSchema = v.object({
  ...baseAttachmentSchema.entries,
  type: v.literal('audio'),
  meta: v.fallback(v.object({
    duration: v.fallback(v.optional(v.number()), undefined),
    colors: v.fallback(v.optional(v.object({
      background: v.fallback(v.optional(v.string()), undefined),
      foreground: v.fallback(v.optional(v.string()), undefined),
      accent: v.fallback(v.optional(v.string()), undefined),
      duration: v.fallback(v.optional(v.number()), undefined),
    })), undefined),
    original: v.fallback(v.optional(v.object({
      duration: v.fallback(v.optional(v.number()), undefined),
      bitrate: v.fallback(v.optional(v.pipe(v.number(), v.minValue(0))), undefined),
    })), undefined),
  }), {}),
});

const unknownAttachmentSchema = v.object({
  ...baseAttachmentSchema.entries,
  type: v.literal('unknown'),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/MediaAttachment}
 */
const mediaAttachmentSchema = v.pipe(
  v.any(),
  v.transform((data: any) => {
    if (!data) return null;

    return {
      mime_type: data.pleroma?.mime_type,
      preview_url: data.url,
      ...data,
    };
  }),
  v.variant('type', [
    imageAttachmentSchema,
    videoAttachmentSchema,
    gifvAttachmentSchema,
    audioAttachmentSchema,
    unknownAttachmentSchema,
  ]),
);

/**
 * @category Entity types
 */
type MediaAttachment = v.InferOutput<typeof mediaAttachmentSchema>;

export { blurhashSchema, mediaAttachmentSchema, type MediaAttachment };
