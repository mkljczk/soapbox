import { InfiniteData, keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';
import { type Chat, type ChatMessage as BaseChatMessage, type PaginatedResponse, chatMessageSchema, type Relationship } from 'pl-api';
import * as v from 'valibot';

import { importEntities } from 'pl-fe/actions/importer';
import { ChatWidgetScreens, useChatContext } from 'pl-fe/contexts/chat-context';
import { useStatContext } from 'pl-fe/contexts/stat-context';
import { Entities } from 'pl-fe/entity-store/entities';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { type ChatMessage, normalizeChatMessage } from 'pl-fe/normalizers/chat-message';
import { reOrderChatListItems } from 'pl-fe/utils/chats';
import { flattenPages, updatePageItem } from 'pl-fe/utils/queries';

import { queryClient } from './client';
import { useFetchRelationships } from './relationships';

const ChatKeys = {
  chat: (chatId?: string) => ['chats', 'chat', chatId] as const,
  chatMessages: (chatId: string) => ['chats', 'messages', chatId] as const,
};

const useChatMessages = (chat: Chat) => {
  const client = useClient();
  const isBlocked = useAppSelector((state) => (state.entities[Entities.RELATIONSHIPS]?.store[chat.account.id] as Relationship)?.blocked_by);

  const getChatMessages = async (chatId: string, pageParam?: Pick<PaginatedResponse<BaseChatMessage>, 'next'>) => {
    const response = await (pageParam?.next ? pageParam.next() : client.chats.getChatMessages(chatId));

    return {
      ...response,
      items: response.items.map(normalizeChatMessage),
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ChatKeys.chatMessages(chat.id),
    queryFn: ({ pageParam }) => getChatMessages(chat.id, pageParam),
    enabled: !isBlocked,
    gcTime: 0,
    staleTime: 0,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<BaseChatMessage>>) | null },
    getNextPageParam: (config) => config.next ? config : undefined,
  });

  const data = flattenPages<ChatMessage>(queryInfo.data as any)?.toReversed();

  return {
    ...queryInfo,
    data,
  };
};

const useChats = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { setUnreadChatsCount } = useStatContext();
  const fetchRelationships = useFetchRelationships();
  const { me } = useLoggedIn();

  const getChats = async (pageParam?: Pick<PaginatedResponse<Chat>, 'next'>): Promise<PaginatedResponse<Chat>> => {
    const response = await (pageParam?.next || client.chats.getChats)();
    const { items } = response;

    setUnreadChatsCount(sumBy(data, (chat) => chat.unread));

    // Set the relationships to these users in the redux store.
    fetchRelationships.mutate({ accountIds: items.map((item) => item.account.id) });
    dispatch(importEntities({ accounts: items.map((item) => item.account) }));

    return response;
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['chats', 'search'],
    queryFn: ({ pageParam }) => getChats(pageParam),
    placeholderData: keepPreviousData,
    enabled: features.chats && !!me,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<Chat>>) | null },
    getNextPageParam: (config) => config.next ? config : undefined,
  });

  const data = flattenPages(queryInfo.data);

  const chatsQuery = {
    ...queryInfo,
    data,
  };

  const getOrCreateChatByAccountId = (accountId: string) =>
    client.chats.createChat(accountId);

  return { chatsQuery, getOrCreateChatByAccountId };
};

const useChat = (chatId?: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const fetchRelationships = useFetchRelationships();

  const getChat = async () => {
    if (chatId) {
      const data = await client.chats.getChat(chatId);

      fetchRelationships.mutate({ accountIds: [data.account.id] });
      dispatch(importEntities({ accounts: [data.account] }));

      return data;
    }
  };

  return useQuery<Chat | undefined>({
    queryKey: ChatKeys.chat(chatId),
    queryFn: getChat,
    gcTime: 0,
    enabled: !!chatId,
  });
};

const useChatActions = (chatId: string) => {
  const { account } = useOwnAccount();
  const client = useClient();

  const { setUnreadChatsCount } = useStatContext();

  const { chat, changeScreen } = useChatContext();

  const markChatAsRead = async (lastReadId: string) =>
    client.chats.markChatAsRead(chatId, lastReadId)
      .then((data) => {
        updatePageItem(['chats', 'search'], data, (o, n) => o.id === n.id);
        const queryData = queryClient.getQueryData<InfiniteData<PaginatedResponse<unknown>>>(['chats', 'search']);

        if (queryData) {
          const flattenedQueryData: any = flattenPages(queryData)?.map((chat: any) => {
            if (chat.id === data.id) {
              return data;
            } else {
              return chat;
            }
          });
          setUnreadChatsCount(sumBy(flattenedQueryData, (chat: Chat) => chat.unread));
        }

        return data;
      })
      .catch(() => null);

  const createChatMessage = useMutation({
    mutationFn: ({ chatId, content, mediaId }: { chatId: string; content: string; mediaId?: string }) =>
      client.chats.createChatMessage(chatId, { content, media_id: mediaId }),
    retry: false,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ['chats', 'messages', variables.chatId],
      });

      // Snapshot the previous value
      const prevContent = variables.content;
      const prevChatMessages = queryClient.getQueryData(['chats', 'messages', variables.chatId]);
      const pendingId = String(Number(new Date()));

      // Optimistically update to the new value
      queryClient.setQueryData(ChatKeys.chatMessages(variables.chatId), (prevResult: any) => {
        const newResult = { ...prevResult };
        newResult.pages = newResult.pages.map((page: any, idx: number) => {
          if (idx === 0) {
            return {
              ...page,
              items: [
                normalizeChatMessage({
                  ...v.parse(chatMessageSchema, {
                    chat_id: variables.chatId,
                    content: variables.content,
                    id: pendingId,
                    created_at: new Date().toISOString(),
                    account_id: account?.id,
                    unread: true,
                  }),
                  pending: true,
                }),
                ...page.items,
              ],
            };
          }

          return page;
        });

        return newResult;
      });

      return { prevChatMessages, prevContent, pendingId };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error: any, variables, context: any) => {
      queryClient.setQueryData(['chats', 'messages', variables.chatId], context.prevChatMessages);
    },
    onSuccess: (response: any, variables, context) => {
      const nextChat = { ...chat, last_message: response };
      updatePageItem(['chats', 'search'], nextChat, (o, n) => o.id === n.id);
      updatePageItem(
        ChatKeys.chatMessages(variables.chatId),
        normalizeChatMessage(response),
        (o) => o.id === context.pendingId,
      );
      reOrderChatListItems();
    },
  });
  const deleteChatMessage = (chatMessageId: string) =>
    client.chats.deleteChatMessage(chatId, chatMessageId);

  const deleteChat = useMutation({
    mutationFn: () => client.chats.deleteChat(chatId),
    onSuccess() {
      changeScreen(ChatWidgetScreens.INBOX);
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatMessages(chatId) });
      queryClient.invalidateQueries({ queryKey: ['chats', 'search'] });
    },
  });

  return {
    createChatMessage,
    deleteChat,
    deleteChatMessage,
    markChatAsRead,
  };
};

export { ChatKeys, useChat, useChatActions, useChats, useChatMessages };
