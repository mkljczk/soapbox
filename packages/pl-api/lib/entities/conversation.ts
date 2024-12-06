import * as v from 'valibot';

import { accountSchema } from './account';
import { statusSchema } from './status';
import { filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Conversation}
 */
const conversationSchema = v.object({
  id: v.string(),
  unread: v.fallback(v.boolean(), false),
  accounts: filteredArray(accountSchema),
  last_status: v.fallback(v.nullable(statusSchema), null),
});

/**
 * @category Entity types
 */
type Conversation = v.InferOutput<typeof conversationSchema>;

export { conversationSchema, type Conversation };
