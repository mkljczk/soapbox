import clsx from 'clsx';
import React, { useState } from 'react';

import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Stack from 'pl-fe/components/ui/stack';
import PlaceholderChat from 'pl-fe/features/placeholder/components/placeholder-chat';
import { useChats } from 'pl-fe/queries/chats';

import ChatListItem from './chat-list-item';

interface IChatList {
  onClickChat: (chat: any) => void;
  parentRef: React.RefObject<HTMLElement>;
  topOffset: number;
}

const ChatList: React.FC<IChatList> = ({ onClickChat, parentRef, topOffset }) => {
  const { chatsQuery: { data: chats, isFetching, hasNextPage, fetchNextPage, refetch } } = useChats();

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => refetch();

  const renderEmpty = () => {
    if (isFetching) {
      return (
        <Stack space={2}>
          <PlaceholderChat />
          <PlaceholderChat />
          <PlaceholderChat />
        </Stack>
      );
    }

    return null;
  };

  return (
    <>
      <div className='relative h-full'>
        <PullToRefresh onRefresh={handleRefresh}>
          <ScrollableList
            onScroll={(top, bottom) => {
              setNearTop(top === 0);
              setNearBottom(bottom === chats?.length);
            }}
            itemClassName='px-2'
            emptyMessage={renderEmpty()}
            placeholderComponent={PlaceholderChat}
            placeholderCount={3}
            hasMore={hasNextPage}
            onLoadMore={handleLoadMore}
            estimatedSize={64}
            parentRef={parentRef}
            loadMoreClassName='mx-4 mb-4'
          >
            {(chats || []).map(chat => (
              <ChatListItem key={chat.id} chat={chat} onClick={onClickChat} />
            ))}
          </ScrollableList>
        </PullToRefresh>

      </div>
      <div
        className={clsx('pointer-events-none absolute inset-x-0 flex justify-center rounded-t-lg bg-gradient-to-b from-white to-transparent pb-12 pt-8 transition-opacity duration-500 black:from-black dark:from-gray-900', {
          'opacity-0': isNearTop,
          'opacity-100 black:opacity-50': !isNearTop,
        })}
        style={{
          top: topOffset,
        }}
      />
      <div
        className={clsx('pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-white to-transparent pb-8 pt-12 transition-opacity duration-500 black:from-black dark:from-gray-900', {
          'opacity-0': isNearBottom,
          'opacity-100 black:opacity-50': !isNearBottom,
        })}
      />
    </>
  );
};

export { ChatList as default };
