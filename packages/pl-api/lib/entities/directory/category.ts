import * as v from 'valibot';

/**
 * @category Directory schemas
 */
const directoryCategorySchema = v.object({
  category: v.string(),
  servers_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
});

/**
 * @category Directory entity types
 */
type DirectoryCategory = v.InferOutput<typeof directoryCategorySchema>;

export { directoryCategorySchema, type DirectoryCategory };
