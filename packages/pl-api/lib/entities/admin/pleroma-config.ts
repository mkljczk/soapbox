import * as v from 'valibot';

/**
 * @category Admin schemas
 */
const pleromaConfigSchema = v.object({
  configs: v.array(v.object({
    value: v.any(),
    group: v.string(),
    key: v.string(),
  })),
  need_reboot: v.boolean(),
});

/**
 * @category Admin types
 */
type PleromaConfig = v.InferOutput<typeof pleromaConfigSchema>

export { pleromaConfigSchema, type PleromaConfig };
