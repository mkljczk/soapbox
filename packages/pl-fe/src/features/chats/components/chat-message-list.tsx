import React, { useEffect, useRef } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Avatar from 'pl-fe/components/ui/avatar';
import Button from 'pl-fe/components/ui/button';
import Divider from 'pl-fe/components/ui/divider';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { Entities } from 'pl-fe/entity-store/entities';
import PlaceholderChatMessage from 'pl-fe/features/placeholder/components/placeholder-chat-message';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useChatActions, useChatMessages } from 'pl-fe/queries/chats';

import ChatMessage from './chat-message';

import type { Chat, Relationship } from 'pl-api';
import type { ChatMessage as ChatMessageEntity } from 'pl-fe/normalizers/chat-message';

const messages = defineMessages({
  today: { id: 'chats.dividers.today', defaultMessage: 'Today' },
  blockedBy: { id: 'chat_message_list.blocked_by', defaultMessage: 'You are blocked by' },
  networkFailureTitle: { id: 'chat_message_list.network_failure.title', defaultMessage: 'Whoops!' },
  networkFailureSubtitle: { id: 'chat_message_list.network_failure.subtitle', defaultMessage: 'We encountered a network failure.' },
  networkFailureAction: { id: 'chat_message_list.network_failure.action', defaultMessage: 'Try again' },
});

type TimeFormat = 'today' | 'date';

const timeChange = (prev: Pick<ChatMessageEntity, 'created_at'>, curr: Pick<ChatMessageEntity, 'created_at'>): TimeFormat | null => {
  const prevDate = new Date(prev.created_at).getDate();
  const currDate = new Date(curr.created_at).getDate();
  const nowDate = new Date().getDate();

  if (prevDate !== currDate) {
    return currDate === nowDate ? 'today' : 'date';
  }

  return null;
};

interface IChatMessageList {
  /** Chat the messages are being rendered from. */
  chat: Chat;
}

/** Scrollable list of chat messages. */
const ChatMessageList: React.FC<IChatMessageList> = ({ chat }) => {
  const intl = useIntl();

  const parentRef = useRef<HTMLDivElement>(null);

  const { markChatAsRead } = useChatActions(chat.id);
  const {
    data: chatMessages,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useChatMessages(chat);

  const formattedChatMessages = chatMessages || [];

  const isBlocked = !!useAppSelector((state) => (state.entities[Entities.RELATIONSHIPS]?.store[chat.account.id] as Relationship)?.blocked_by);

  const buildCachedMessages = (): Array<ChatMessageEntity | { type: 'divider'; text: string }> => {
    if (!chatMessages) {
      return [];
    }

    const currentYear = new Date().getFullYear();

    return chatMessages.reduce((acc: any, curr: any, idx: number) => {
      const lastMessage = formattedChatMessages[idx - 1];

      const messageDate = new Date(curr.created_at);

      if (lastMessage) {
        switch (timeChange(lastMessage, curr)) {
          case 'today':
            acc.push({
              type: 'divider',
              text: intl.formatMessage(messages.today),
            });
            break;
          case 'date':
            acc.push({
              type: 'divider',
              text: intl.formatDate(messageDate, {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
                month: 'short',
                day: 'numeric',
                year: messageDate.getFullYear() !== currentYear ? '2-digit' : undefined,
              }),
            });
            break;
        }
      }

      acc.push(curr);
      return acc;
    }, []);
  };
  const cachedChatMessages = buildCachedMessages();

  const handleStartReached = () => {
    if (hasNextPage && !isLoading && !isFetching && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderDivider = (key: React.Key, text: string) => <Divider key={key} text={text} textSize='xs' />;

  useEffect(() => {
    const lastMessage = formattedChatMessages[formattedChatMessages.length - 1];
    if (!lastMessage) {
      return;
    }

    const lastMessageId = lastMessage.id;
    const isMessagePending = lastMessage.pending;

    /**
     * Only "mark the message as read" if..
     * 1) it is not pending and
     * 2) it has not already been read
    */
    if (!isMessagePending) {
      markChatAsRead(lastMessageId);
    }
  }, [formattedChatMessages.length]);

  if (isBlocked) {
    return (
      <Stack alignItems='center' justifyContent='center' className='h-full grow'>
        <Stack alignItems='center' space={2}>
          <Avatar src={chat.account.avatar} alt={chat.account.avatar_description} size={75} />
          <Text align='center'>
            <>
              <Text tag='span'>{intl.formatMessage(messages.blockedBy)}</Text>
              {' '}
              <Text tag='span' theme='primary'>@{chat.account.acct}</Text>
            </>
          </Text>
        </Stack>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack alignItems='center' justifyContent='center' className='h-full grow'>
        <Stack space={4}>
          <Stack space={1}>
            <Text size='lg' weight='bold' align='center'>
              {intl.formatMessage(messages.networkFailureTitle)}
            </Text>
            <Text theme='muted' align='center'>
              {intl.formatMessage(messages.networkFailureSubtitle)}
            </Text>
          </Stack>

          <div className='mx-auto'>
            <Button theme='primary' onClick={() => refetch()}>
              {intl.formatMessage(messages.networkFailureAction)}
            </Button>
          </div>
        </Stack>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <div className='flex grow flex-col justify-end pb-4'>
        <div className='px-4'>
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage />
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage />
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full grow flex-col-reverse space-y-6 overflow-auto' style={{ scrollbarGutter: 'auto' }}>
      <div className='flex grow flex-col justify-end' ref={parentRef}>
        <ScrollableList
          listClassName='mb-2'
          loadMoreClassName='w-fit mx-auto mb-2'
          alignToBottom
          initialIndex={cachedChatMessages.length - 1}
          hasMore={hasNextPage}
          isLoading={isFetching}
          showLoading={isFetching && !isFetchingNextPage}
          onLoadMore={handleStartReached}
          parentRef={parentRef}
        >
          {cachedChatMessages.map((chatMessage, index) => {
            if (chatMessage.type === 'divider') {
              return renderDivider(index, chatMessage.text);
            } else {
              return <ChatMessage chat={chat} chatMessage={chatMessage} />;
            }
          })}
        </ScrollableList>
      </div>
    </div>
  );
};

export { ChatMessageList as default };
