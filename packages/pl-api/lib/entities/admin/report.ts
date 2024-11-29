import pick from 'lodash.pick';
import * as v from 'valibot';

import { ruleSchema } from '../rule';
import { statusWithoutAccountSchema } from '../status';
import { datetimeSchema, filteredArray } from '../utils';

import { adminAccountSchema } from './account';

/**
 * @category Admin schemas
 * @see {@link https://docs.joinmastodon.org/entities/Admin_Report/}
 */
const adminReportSchema = v.pipe(
  v.any(),
  v.transform((report: any) => {
    if (report.actor) {
    /**
     * Convert Pleroma report schema
     * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminreports}
     */
      return {
        action_taken: report.state !== 'open',
        comment: report.content,
        updated_at: report.created_at,
        account: report.actor,
        target_account: report.account,
        ...(pick(report, ['id', 'assigned_account', 'created_at', 'rules', 'statuses'])),
      };
    }
    return report;
  }),
  v.object({
    id: v.string(),
    action_taken: v.fallback(v.optional(v.boolean()), undefined),
    action_taken_at: v.fallback(v.nullable(datetimeSchema), null),
    category: v.fallback(v.optional(v.string()), undefined),
    comment: v.fallback(v.optional(v.string()), undefined),
    forwarded: v.fallback(v.optional(v.boolean()), undefined),
    created_at: v.fallback(v.optional(datetimeSchema), undefined),
    updated_at: v.fallback(v.optional(datetimeSchema), undefined),
    account: adminAccountSchema,
    target_account: adminAccountSchema,
    assigned_account: v.fallback(v.nullable(adminAccountSchema), null),
    action_taken_by_account: v.fallback(v.nullable(adminAccountSchema), null),
    statuses: filteredArray(statusWithoutAccountSchema),
    rules: filteredArray(ruleSchema),
  }),
);

/**
 * @category Admin types
 */
type AdminReport = v.InferOutput<typeof adminReportSchema>;

export { adminReportSchema, type AdminReport };
