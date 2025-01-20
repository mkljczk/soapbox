import * as v from 'valibot';

import { accountSchema } from './account';
import { datetimeSchema } from './utils';

/**
 * @category Schemas
 */
const scrobbleSchema = v.pipe(
  v.any(),
  v.transform((scrobble: any) => scrobble ? {
    external_link: scrobble.externalLink,
    ...scrobble,
  } : null),
  v.object({
    id: v.pipe(v.unknown(), v.transform(String)),
    account: accountSchema,
    created_at: datetimeSchema,
    title: v.string(),
    artist: v.fallback(v.string(), ''),
    album: v.fallback(v.string(), ''),
    external_link: v.fallback(v.nullable(v.string()), null),
    length: v.fallback(v.nullable(v.number()), null),
  }),
);

/**
 * @category Entity types
 */
type Scrobble = v.InferOutput<typeof scrobbleSchema>;

export { scrobbleSchema, type Scrobble };
