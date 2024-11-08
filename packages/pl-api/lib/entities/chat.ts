import * as v from 'valibot';

import { accountSchema } from './account';
import { chatMessageSchema } from './chat-message';
import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.pleroma.social/backend/development/API/chats/#getting-a-list-of-chats}
 */
const chatSchema = v.object({
  id: v.string(),
  account: accountSchema,
  unread: v.pipe(v.number(), v.integer()),
  last_message: v.fallback(v.nullable(chatMessageSchema), null),
  updated_at: datetimeSchema,
});

type Chat = v.InferOutput<typeof chatSchema>;

export { chatSchema, type Chat };
