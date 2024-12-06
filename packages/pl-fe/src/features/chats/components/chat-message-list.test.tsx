import userEvent from '@testing-library/user-event';
import React from 'react';

import { __stub } from 'pl-fe/api';
import { ChatContext } from 'pl-fe/contexts/chat-context';
import { buildAccount, buildInstance } from 'pl-fe/jest/factory';
import { queryClient, render, rootState, screen, waitFor } from 'pl-fe/jest/test-helpers';
import { normalizeChatMessage } from 'pl-fe/normalizers/chat-message';
import { IChat } from 'pl-fe/queries/chats';
import { ChatMessage } from 'pl-fe/types/entities';

import ChatMessageList from './chat-message-list';

const chat: IChat = {
  account: buildAccount({
    username: 'username',
    verified: true,
    id: '1',
    acct: 'acct',
    avatar: 'avatar',
    avatar_static: 'avatar',
    display_name: 'my name',
  }),
  created_at: '2020-06-10T02:05:06.000Z',
  id: '14',
  last_message: null,
  unread: 5,
};

const chatMessages: ChatMessage[] = [
  normalizeChatMessage({
    account_id: '1',
    chat_id: '14',
    content: 'this is the first chat',
    created_at: '2022-09-09T16:02:26.186Z',
    id: '1',
    unread: false,
    pending: false,
  }),
  normalizeChatMessage({
    account_id: '2',
    chat_id: '14',
    content: 'this is the second chat',
    created_at: '2022-09-09T16:04:26.186Z',
    id: '2',
    unread: true,
    pending: false,
  }),
];

// Mock scrollIntoView function.
window.HTMLElement.prototype.scrollIntoView = () => { };
Object.assign(navigator, {
  clipboard: {
    writeText: () => { },
  },
});

const store = {
  ...rootState,
  me: '1',
  instance: buildInstance({ version: '3.4.1 (compatible; TruthSocial 1.0.0+unreleased)' }),
};

const renderComponentWithChatContext = () => render(
  <ChatContext.Provider value={{ chat }}>
    <ChatMessageList chat={chat} />
  </ChatContext.Provider>,
  undefined,
  store,
);

beforeEach(() => {
  queryClient.clear();
});

describe('<ChatMessageList />', () => {
  describe('when the query is loading', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}/messages`).reply(200, chatMessages, {
          link: null,
        });
      });
    });

    it('displays the skeleton loader', async () => {
      renderComponentWithChatContext();

      expect(screen.queryAllByTestId('placeholder-chat-message')).toHaveLength(5);

      await waitFor(() => {
        expect(screen.getByTestId('chat-message-list-intro')).toBeInTheDocument();
        expect(screen.queryAllByTestId('placeholder-chat-message')).toHaveLength(0);
      });
    });
  });

  describe('when the query is finished loading', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}/messages`).reply(200, chatMessages, {
          link: null,
        });
      });
    });

    it('displays the intro', async () => {
      renderComponentWithChatContext();

      expect(screen.queryAllByTestId('chat-message-list-intro')).toHaveLength(0);

      await waitFor(() => {
        expect(screen.getByTestId('chat-message-list-intro')).toBeInTheDocument();
      });
    });

    it('displays the messages', async () => {
      renderComponentWithChatContext();

      expect(screen.queryAllByTestId('chat-message')).toHaveLength(0);

      await waitFor(() => {
        expect(screen.queryAllByTestId('chat-message')).toHaveLength(chatMessages.length);
      });
    });

    it('displays the correct menu options depending on the owner of the message', async () => {
      renderComponentWithChatContext();

      await waitFor(() => {
        expect(screen.queryAllByTestId('chat-message-menu')).toHaveLength(2);
      });

      // my message
      await userEvent.click(screen.queryAllByTestId('chat-message-menu')[0].querySelector('button') as any);

      // other user message
      await userEvent.click(screen.queryAllByTestId('chat-message-menu')[1].querySelector('button') as any);
    });
  });
});
