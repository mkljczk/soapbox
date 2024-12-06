import sumBy from 'lodash/sumBy';

import { normalizeChatMessage } from 'pl-fe/normalizers/chat-message';
import { ChatKeys } from 'pl-fe/queries/chats';
import { queryClient } from 'pl-fe/queries/client';

import { compareDate } from './comparators';
import { appendPageItem, flattenPages, sortQueryData, updatePageItem } from './queries';

import type { InfiniteData } from '@tanstack/react-query';
import type { Chat, PaginatedResponse } from 'pl-api';

/**
 * Update the Chat entity inside the ChatSearch query.
 * @param newChat - Chat entity.
 */
const updateChatInChatSearchQuery = (newChat: Chat) => {
  updatePageItem<Chat>(['chats', 'search'], newChat as any, (o, n) => o.id === n.id);
};

/**
 * Re-order the ChatSearch query by the last message timestamp.
 */
const reOrderChatListItems = () => {
  sortQueryData<Chat>(['chats', 'search'], (chatA, chatB) => compareDate(
    chatA.last_message?.created_at as string,
    chatB.last_message?.created_at as string,
  ));
};

/**
 * Check if a Chat entity exists within the cached ChatSearch query.
 * @param chatId - String
 * @returns Boolean
 */
const checkIfChatExists = (chatId: string) => {
  const currentChats = flattenPages(
    queryClient.getQueryData<InfiniteData<PaginatedResponse<Chat>>>(['chats', 'search']),
  );

  return currentChats?.find((chat: Chat) => chat.id === chatId);
};

/**
 * Force a re-fetch of ChatSearch.
 */
const invalidateChatSearchQuery = () => {
  queryClient.invalidateQueries({
    queryKey: ['chats', 'search'],
  });
};

const updateChatListItem = (newChat: Chat) => {
  const { id: chatId, last_message: lastMessage } = newChat;

  const isChatAlreadyLoaded = checkIfChatExists(chatId);

  if (isChatAlreadyLoaded) {
    // If the chat exists in the client, let's update it.
    updateChatInChatSearchQuery(newChat);
    // Now that we have the new chat loaded, let's re-sort to put
    // the most recent on top.
    reOrderChatListItems();
  } else {
    // If this is a brand-new chat, let's invalid the queries.
    invalidateChatSearchQuery();
  }

  if (lastMessage) {
    // Update the Chat Messages query data.
    appendPageItem(ChatKeys.chatMessages(newChat.id), normalizeChatMessage(lastMessage));
  }
};

/** Get unread chats count. */
const getUnreadChatsCount = (): number => {
  const chats = flattenPages(
    queryClient.getQueryData<InfiniteData<PaginatedResponse<Chat>>>(['chats', 'search']),
  );

  return sumBy(chats, chat => chat.unread);
};

export { updateChatListItem, getUnreadChatsCount, reOrderChatListItems };
