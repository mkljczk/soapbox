import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Ip/} */
const adminIpSchema = v.object({
  ip: v.pipe(v.string(), v.ip()),
  used_at: datetimeSchema,
});

type AdminIp = v.InferOutput<typeof adminIpSchema>;

export {
  adminIpSchema,
  type AdminIp,
};
