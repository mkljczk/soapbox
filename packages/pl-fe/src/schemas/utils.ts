import * as v from 'valibot';

/** Validates individual items in an array, dropping any that aren't valid. */
const filteredArray = <T>(schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>) =>
  v.pipe(
    v.fallback(v.array(v.any()), []),
    v.transform((arr) => (
      arr.map((item) => {
        const parsed = v.safeParse(schema, item);
        return parsed.success ? parsed.output : undefined;
      }).filter((item): item is T => Boolean(item))
    )),
  );

/** valibot schema to force the value into an object, if it isn't already. */
const coerceObject = <T extends v.ObjectEntries>(shape: T) =>
  v.pipe(
    v.any(),
    v.transform((input) => typeof input === 'object' ? input : {}),
    v.object(shape),
  );

export { filteredArray, coerceObject };
