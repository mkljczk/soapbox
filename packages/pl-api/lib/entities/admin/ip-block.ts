import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_IpBlock/} */
const adminIpBlockSchema = v.object({
  id: v.string(),
  ip: v.pipe(v.string(), v.ip()),
  severity: v.picklist(['sign_up_requires_approval', 'sign_up_block', 'no_access']),
  comment: v.fallback(v.string(), ''),
  created_at: datetimeSchema,
  expires_at: v.fallback(v.nullable(datetimeSchema), null),
});

type AdminIpBlock = v.InferOutput<typeof adminIpBlockSchema>;

export {
  adminIpBlockSchema,
  type AdminIpBlock,
};
