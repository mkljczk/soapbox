import * as v from 'valibot';

/**
 * @category Directory schemas
 */
const directoryStatisticsPeriodSchema = v.object({
  period: v.pipe(v.string(), v.isoDate()),
  server_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
  user_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
  active_user_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
});

/**
 * @category Directory types
 */
type DirectoryStatisticsPeriod = v.InferOutput<typeof directoryStatisticsPeriodSchema>;

export { directoryStatisticsPeriodSchema, type DirectoryStatisticsPeriod };
