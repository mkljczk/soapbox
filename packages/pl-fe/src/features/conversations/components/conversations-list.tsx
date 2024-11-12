import debounce from 'lodash/debounce';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { expandConversations } from 'pl-fe/actions/conversations';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import Conversation from './conversation';

const ConversationsList: React.FC = () => {
  const dispatch = useAppDispatch();

  const conversations = useAppSelector((state) => state.conversations.items);
  const isLoading = useAppSelector((state) => state.conversations.isLoading);
  const hasMore = useAppSelector((state) => !!state.conversations.next);

  const getCurrentIndex = (id: string) => conversations.findIndex(x => x.id === id);

  const handleMoveUp = (id: string) => {
    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(elementIndex);
  };

  const selectChild = (index: number) => {
    const selector = `#direct-list [data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();
  };

  const handleLoadOlder = debounce(() => {
    if (hasMore) dispatch(expandConversations());
  }, 300, { leading: true });

  return (
    <ScrollableList
      hasMore={hasMore}
      onLoadMore={handleLoadOlder}
      id='direct-list'
      isLoading={isLoading}
      showLoading={isLoading && conversations.length === 0}
      emptyMessage={<FormattedMessage id='empty_column.direct' defaultMessage="You don't have any direct messages yet. When you send or receive one, it will show up here." />}
    >
      {conversations.map((item: any) => (
        <Conversation
          key={item.id}
          conversationId={item.id}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ))}
    </ScrollableList>
  );
};

export { ConversationsList as default };
