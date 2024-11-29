import * as v from 'valibot';

const hexSchema = v.pipe(v.string(), v.regex(/^#[a-f0-9]{6}$/i));

/**
 * @category Schemas
 */
const roleSchema = v.object({
  id: v.fallback(v.string(), ''),
  name: v.fallback(v.string(), ''),
  color: v.fallback(hexSchema, ''),
  permissions: v.fallback(v.string(), ''),
  highlighted: v.fallback(v.boolean(), true),
});

/**
 * @category Entity types
 */
type Role = v.InferOutput<typeof roleSchema>;

export {
  roleSchema,
  type Role,
};
