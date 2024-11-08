import * as v from 'valibot';

/** @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminrules} */
const adminRuleSchema = v.object({
  id: v.string(),
  text: v.fallback(v.string(), ''),
  hint: v.fallback(v.string(), ''),
  priority: v.fallback(v.nullable(v.number()), null),
});

type AdminRule = v.InferOutput<typeof adminRuleSchema>;

export { adminRuleSchema, type AdminRule };
