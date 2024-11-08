import * as v from 'valibot';

const directoryLanguageSchema = v.object({
  locale: v.string(),
  language: v.string(),
  servers_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
});

type DirectoryLanguage = v.InferOutput<typeof directoryLanguageSchema>;

export { directoryLanguageSchema, type DirectoryLanguage };
