import * as v from 'valibot';

import { coerceObject } from './utils';

const interactionPolicyEntrySchema = v.picklist(['public', 'followers', 'following', 'mutuals', 'mentioned', 'author', 'me']);

/**
 * @category Entity types
 */
type InteractionPolicyEntry = v.InferOutput<typeof interactionPolicyEntrySchema>;

const interactionPolicyRuleSchema = coerceObject({
  always: v.fallback(v.array(interactionPolicyEntrySchema), ['public', 'me']),
  with_approval: v.fallback(v.array(interactionPolicyEntrySchema), []),
});

/**
 * @category Schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const interactionPolicySchema = coerceObject({
  can_favourite: interactionPolicyRuleSchema,
  can_reblog: interactionPolicyRuleSchema,
  can_reply: interactionPolicyRuleSchema,
});

/**
 * @category Entity types
 */
type InteractionPolicy = v.InferOutput<typeof interactionPolicySchema>;

/**
 * @category Schemas
 */
const interactionPoliciesSchema = coerceObject({
  public: interactionPolicySchema,
  unlisted: interactionPolicySchema,
  private: interactionPolicySchema,
  direct: interactionPolicySchema,
});

/**
 * @category Entity types
 */
type InteractionPolicies = v.InferOutput<typeof interactionPoliciesSchema>;

export { interactionPolicySchema, interactionPoliciesSchema, type InteractionPolicyEntry, type InteractionPolicy, type InteractionPolicies };

