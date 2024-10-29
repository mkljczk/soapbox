import * as v from 'valibot';

import { accountSchema } from './account';
import { statusSchema } from './status';
import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger.yaml#/definitions/interactionRequest}
 */
const interactionRequestSchema = v.object({
  accepted_at: v.fallback(v.nullable(datetimeSchema), null),
  account: accountSchema,
  created_at: datetimeSchema,
  id: v.string(),
  rejected_at: v.fallback(v.nullable(datetimeSchema), null),
  reply: v.fallback(v.nullable(statusSchema), null),
  status: v.fallback(v.nullable(statusSchema), null),
  type: v.picklist(['favourite', 'reply', 'reblog']),
  uri: v.fallback(v.nullable(v.string()), null),
});

type InteractionRequest = v.InferOutput<typeof interactionRequestSchema>;

export { interactionRequestSchema, type InteractionRequest };
