import { PaginationParams, WithMutedParam } from './common';

/**
 * @category Request params
 */
type GetChatsParams = PaginationParams & WithMutedParam;

/**
 * @category Request params
 */
type GetChatMessagesParams = PaginationParams;

/**
 * @category Request params
 */
type CreateChatMessageParams = {
  content?: string;
  media_id: string;
} | {
  content: string;
  media_id?: string;
};

export type {
  GetChatsParams,
  GetChatMessagesParams,
  CreateChatMessageParams,
};
