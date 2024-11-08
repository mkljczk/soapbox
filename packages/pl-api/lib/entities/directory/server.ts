import * as v from 'valibot';

const directoryServerSchema = v.object({
  domain: v.string(),
  version: v.string(),
  description: v.string(),
  languages: v.array(v.string()),
  region: v.string(),
  categories: v.array(v.string()),
  proxied_thumbnail: v.fallback(v.nullable(v.pipe(v.string(), v.url())), null),
  blurhash: v.fallback(v.nullable(v.string()), null),
  total_users: v.pipe(v.unknown(), v.transform(Number)),
  last_week_users: v.pipe(v.unknown(), v.transform(Number)),
  approval_required: v.boolean(),
  language: v.string(),
  category: v.string(),
});

type DirectoryServer = v.InferOutput<typeof directoryServerSchema>;

export { directoryServerSchema, type DirectoryServer };
