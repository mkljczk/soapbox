import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.joinmastodon.org/entities/Admin_Ip/}
 */
const adminIpSchema = v.object({
  ip: v.pipe(v.string(), v.ip()),
  used_at: datetimeSchema,
});

/**
 * @category Admin entity types
 */
type AdminIp = v.InferOutput<typeof adminIpSchema>;

export {
  adminIpSchema,
  type AdminIp,
};
