import * as v from 'valibot';

/**
 * @category Directory schemas
 */
const directoryLanguageSchema = v.object({
  locale: v.string(),
  language: v.string(),
  servers_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
});

/**
 * @category Directory types
 */
type DirectoryLanguage = v.InferOutput<typeof directoryLanguageSchema>;

export { directoryLanguageSchema, type DirectoryLanguage };
