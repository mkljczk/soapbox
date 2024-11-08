import * as v from 'valibot';

const directoryStatisticsPeriodSchema = v.object({
  period: v.pipe(v.string(), v.isoDate()),
  server_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
  user_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
  active_user_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
});

type DirectoryStatisticsPeriod = v.InferOutput<typeof directoryStatisticsPeriodSchema>;

export { directoryStatisticsPeriodSchema, type DirectoryStatisticsPeriod };
