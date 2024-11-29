import pick from 'lodash.pick';
import * as v from 'valibot';

import { announcementSchema } from '../announcement';

/**
 * @category Admin schemas
 * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminannouncements}
 */
const adminAnnouncementSchema = v.pipe(
  v.any(),
  v.transform((announcement: any) => ({
    ...announcement,
    ...pick(announcement.pleroma, 'raw_content'),
  })),
  v.object({
    ...announcementSchema.entries,
    raw_content: v.fallback(v.string(), ''),
  }),
);

/**
 * @category Admin types
 */
type AdminAnnouncement = v.InferOutput<typeof adminAnnouncementSchema>;

export { adminAnnouncementSchema, type AdminAnnouncement };
