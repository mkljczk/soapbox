import * as v from 'valibot';

import { instanceSchema } from '../entities';

import type { ALL_SCHEMAS } from './all-schemas';

const nullSchema = v.fallback(v.null(), null);

const IMPORTED_SCHEMAS = {
  instanceSchema,
} as typeof ALL_SCHEMAS;

const SCHEMAS = new Proxy(IMPORTED_SCHEMAS, {
  get: (target, p: keyof typeof ALL_SCHEMAS) => p in target ? target[p] : nullSchema,
});

const importSchemas = (schemas: Partial<typeof ALL_SCHEMAS>) =>
  // @ts-ignore
  Object.entries(schemas).forEach(([key, value]) => IMPORTED_SCHEMAS[key] = value);

export { SCHEMAS, importSchemas };
