import * as v from 'valibot';

/**
 * @category Schemas
 */
const pleromaConfigSchema = v.object({
  configs: v.array(v.object({
    value: v.any(),
    group: v.string(),
    key: v.string(),
  })),
  need_reboot: v.boolean(),
});

type PleromaConfig = v.InferOutput<typeof pleromaConfigSchema>

export { pleromaConfigSchema, type PleromaConfig };
