import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.joinmastodon.org/entities/Admin_DomainBlock/}
 */
const adminDomainBlockSchema = v.object({
  id: v.string(),
  domain: v.string(),
  digest: v.string(),
  created_at: datetimeSchema,
  severity: v.picklist(['silence', 'suspend', 'noop']),
  reject_media: v.boolean(),
  reject_reports: v.boolean(),
  private_comment: v.fallback(v.nullable(v.string()), null),
  public_comment: v.fallback(v.nullable(v.string()), null),
  obfuscate: v.boolean(),
});

/**
 * @category Admin entity types
 */
type AdminDomainBlock = v.InferOutput<typeof adminDomainBlockSchema>;

export {
  adminDomainBlockSchema,
  type AdminDomainBlock,
};
