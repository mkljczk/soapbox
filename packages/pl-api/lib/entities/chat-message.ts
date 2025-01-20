import * as v from 'valibot';

import { customEmojiSchema } from './custom-emoji';
import { mediaAttachmentSchema } from './media-attachment';
import { previewCardSchema } from './preview-card';
import { datetimeSchema, filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.pleroma.social/backend/development/API/chats/#getting-the-messages-for-a-chat}
 */
const chatMessageSchema = v.object({
  id: v.string(),
  content: v.fallback(v.string(), ''),
  chat_id: v.string(),
  account_id: v.string(),
  created_at: datetimeSchema,
  emojis: filteredArray(customEmojiSchema),
  attachment: v.fallback(v.nullable(mediaAttachmentSchema), null),
  unread: v.boolean(),
  card: v.fallback(v.nullable(previewCardSchema), null),
});

/**
 * @category Entity types
 */
type ChatMessage = v.InferOutput<typeof chatMessageSchema>;

export { chatMessageSchema, type ChatMessage };
