import * as v from 'valibot';

import { coerceObject } from './utils';

const mrfSimpleSchema = coerceObject(v.entriesFromList(
  [
    'accept',
    'avatar_removal',
    'banner_removal',
    'federated_timeline_removal',
    'followers_only',
    'media_nsfw',
    'media_removal',
    'reject',
    'reject_deletes',
    'report_removal',
  ],
  v.fallback(v.array(v.string()), []),
));

type MRFSimple = v.InferOutput<typeof mrfSimpleSchema>;

export { mrfSimpleSchema, type MRFSimple };
