import * as v from 'valibot';

const directoryCategorySchema = v.object({
  category: v.string(),
  servers_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
});

type DirectoryCategory = v.InferOutput<typeof directoryCategorySchema>;

export { directoryCategorySchema, type DirectoryCategory };
