import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.joinmastodon.org/entities/Admin_EmailDomainBlock/}
 */
const adminEmailDomainBlockSchema = v.object({
  id: v.string(),
  domain: v.string(),
  created_at: datetimeSchema,
  history: v.array(v.object({
    day: v.pipe(v.unknown(), v.transform(String)),
    accounts: v.pipe(v.unknown(), v.transform(String)),
    uses: v.pipe(v.unknown(), v.transform(String)),
  })),
});

/**
 * @category Admin entity types
 */
type AdminEmailDomainBlock = v.InferOutput<typeof adminEmailDomainBlockSchema>;

export {
  adminEmailDomainBlockSchema,
  type AdminEmailDomainBlock,
};
