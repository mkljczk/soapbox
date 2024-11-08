import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_DomainAllow/} */
const adminDomainAllowSchema = v.object({
  id: v.string(),
  domain: v.string(),
  created_at: datetimeSchema,
});

type AdminDomainAllow = v.InferOutput<typeof adminDomainAllowSchema>;

export {
  adminDomainAllowSchema,
  type AdminDomainAllow,
};
