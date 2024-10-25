import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { toggleMainWindow } from 'pl-fe/actions/chats';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { useChat } from 'pl-fe/queries/chats';

import type { Chat } from 'pl-api';

const ChatContext = createContext<any>({
  isOpen: false,
});

enum ChatWidgetScreens {
  INBOX = 'INBOX',
  SEARCH = 'SEARCH',
  CHAT = 'CHAT',
  CHAT_SETTINGS = 'CHAT_SETTINGS'
}

interface IChatProvider {
  children: React.ReactNode;
}

const ChatProvider: React.FC<IChatProvider> = ({ children }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { chats } = useSettings();

  const path = history.location.pathname;
  const isUsingMainChatPage = Boolean(path.match(/^\/chats/));
  const { chatId } = useParams<{ chatId: string }>();

  const [screen, setScreen] = useState<ChatWidgetScreens>(ChatWidgetScreens.INBOX);
  const [currentChatId, setCurrentChatId] = useState<null | string>(chatId);

  const { data: chat } = useChat(currentChatId as string);

  const isOpen = chats.mainWindow === 'open';

  const changeScreen = (screen: ChatWidgetScreens, currentChatId?: string | null) => {
    setCurrentChatId(currentChatId || null);
    setScreen(screen);
  };

  const toggleChatPane = () => dispatch(toggleMainWindow());

  const value = useMemo(() => ({
    chat,
    isOpen,
    isUsingMainChatPage,
    toggleChatPane,
    screen,
    changeScreen,
    currentChatId,
  }), [chat, currentChatId, isUsingMainChatPage, isOpen, screen, changeScreen]);

  useEffect(() => {
    if (chatId) {
      setCurrentChatId(chatId);
    } else {
      setCurrentChatId(null);
    }
  }, [chatId]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

interface IChatContext {
  chat: Chat | null;
  isOpen: boolean;
  isUsingMainChatPage?: boolean;
  toggleChatPane(): void;
  screen: ChatWidgetScreens;
  currentChatId: string | null;
  changeScreen(screen: ChatWidgetScreens, currentChatId?: string | null): void;
}

const useChatContext = (): IChatContext => useContext(ChatContext);

export { ChatContext, ChatProvider, useChatContext, ChatWidgetScreens };
