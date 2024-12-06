import * as v from 'valibot';

const notificationPolicyRuleSchema = v.picklist(['accept', 'filter', 'drop']);

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/NotificationPolicy}
 */
const notificationPolicySchema = v.object({
  for_not_following: notificationPolicyRuleSchema,
  for_not_followers: notificationPolicyRuleSchema,
  for_new_accounts: notificationPolicyRuleSchema,
  for_private_mentions: notificationPolicyRuleSchema,
  for_limited_accounts: notificationPolicyRuleSchema,
  summary: v.object({
    pending_requests_count: v.pipe(v.number(), v.integer()),
    pending_notifications_count: v.pipe(v.number(), v.integer()),
  }),
});

/**
 * @category Entity types
 */
type NotificationPolicy = v.InferOutput<typeof notificationPolicySchema>;

export { notificationPolicySchema, type NotificationPolicy };
