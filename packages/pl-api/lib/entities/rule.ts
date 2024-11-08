import * as v from 'valibot';

const baseRuleSchema = v.object({
  id: v.string(),
  text: v.fallback(v.string(), ''),
  hint: v.fallback(v.string(), ''),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Rule/}
 */
const ruleSchema = v.pipe(
  v.any(),
  v.transform((data: any) => ({
    ...data,
    hint: data.hint || data.subtext,
  })),
  baseRuleSchema,
);

type Rule = v.InferOutput<typeof ruleSchema>;

export { ruleSchema, type Rule };
