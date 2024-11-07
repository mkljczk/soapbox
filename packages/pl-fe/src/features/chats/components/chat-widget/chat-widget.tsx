import { useLocation } from '@tanstack/react-router';
import React from 'react';

import { ChatProvider } from 'pl-fe/contexts/chat-context';

import ChatPane from '../chat-pane/chat-pane';

const ChatWidget = () => {
  const location = useLocation();

  const path = location.pathname;
  const isChatsPath = Boolean(path.match(/^\/chats/));

  if (isChatsPath) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
};

export { ChatWidget as default };
