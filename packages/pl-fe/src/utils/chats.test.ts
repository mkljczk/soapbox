import { buildAccount } from 'pl-fe/jest/factory';
import { normalizeChatMessage } from 'pl-fe/normalizers/chat-message';
import { ChatKeys, IChat } from 'pl-fe/queries/chats';
import { queryClient } from 'pl-fe/queries/client';

import { updateChatMessage } from './chats';

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
  id: '1',
  last_message: null,
  unread: 0,
};

const buildChatMessage = (id: string) => normalizeChatMessage({
  id,
  chat_id: '1',
  account_id: '1',
  content: `chat message #${id}`,
  created_at: '2020-06-10T02:05:06.000Z',
  unread: true,
});

describe('chat utils', () => {
  describe('updateChatMessage()', () => {
    const initialChatMessage = buildChatMessage('1');

    beforeEach(() => {
      const initialQueryData = {
        pages: [
          { result: [initialChatMessage], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(ChatKeys.chatMessages(chat.id), initialQueryData);
    });

    it('correctly updates the chat message', () => {
      expect(
        (queryClient.getQueryData(ChatKeys.chatMessages(chat.id)) as any).pages[0].result[0].content,
      ).toEqual(initialChatMessage.content);

      const nextChatMessage = normalizeChatMessage({
        ...initialChatMessage.toJS(),
        content: 'new content',
      });

      updateChatMessage(nextChatMessage);
      expect(
        (queryClient.getQueryData(ChatKeys.chatMessages(chat.id)) as any).pages[0].result[0].content,
      ).toEqual(nextChatMessage.content);
    });
  });
});
