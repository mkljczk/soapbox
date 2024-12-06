import { Map as ImmutableMap } from 'immutable';
import sumBy from 'lodash/sumBy';
import { useEffect } from 'react';

import { __stub } from 'pl-fe/api';
import { buildAccount, buildRelationship } from 'pl-fe/jest/factory';
import { createTestStore, mockStore, queryClient, renderHook, rootState, waitFor } from 'pl-fe/jest/test-helpers';
import { normalizeChatMessage } from 'pl-fe/normalizers/chat-message';
import { Store } from 'pl-fe/store';
import { flattenPages } from 'pl-fe/utils/queries';

import { ChatKeys, IChat, useChat, useChatActions, useChatMessages, useChats } from './chats';

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
  expiration: 1209600,
  unread: true,
});

describe('ChatKeys', () => {
  it('has a "chat" key', () => {
    const id = '1';

    expect(ChatKeys.chat(id)).toEqual(['chats', 'chat', id]);
  });

  it('has a "chatMessages" key', () => {
    const id = '1';

    expect(ChatKeys.chatMessages(id)).toEqual(['chats', 'messages', id]);
  });
});

describe('useChatMessages', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    queryClient.clear();
  });

  describe('when the user is blocked', () => {
    beforeEach(() => {
      const state = {
        ...rootState,
        relationships: ImmutableMap({ '1': buildRelationship({ blocked_by: true }) }),
      };

      store = mockStore(state);
    });

    it('is does not fetch the endpoint', async () => {
      const { result } = renderHook(() => useChatMessages(chat), undefined, store);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.data?.length).toBeUndefined();
    });
  });

  describe('when the user is not blocked', () => {
    describe('with a successful request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/pleroma/chats/${chat.id}/messages`)
            .reply(200, [
              buildChatMessage('2'),
            ], {
              link: `<https://example.com/api/v1/pleroma/chats/${chat.id}/messages?since_id=2>; rel="prev"`,
            });
        });
      });

      it('is successful', async () => {
        const { result } = renderHook(() => useChatMessages(chat));

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.data?.length).toBe(1);
      });
    });

    describe('with an unsuccessful query', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/pleroma/chats/${chat.id}/messages`).networkError();
        });
      });

      it('is has error state', async() => {
        const { result } = renderHook(() => useChatMessages(chat));

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.error).toBeDefined();
      });
    });
  });
});

describe('useChats', () => {
  // let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    queryClient.clear();
  });

  // describe('with a successful request', () => {
  //   beforeEach(() => {
  //     const state = rootState.setIn(['instance', 'version'], '2.7.2 (compatible; Pleroma 2.2.0)');
  //     store = mockStore(state);

  //     __stub((mock) => {
  //       mock.onGet('/api/v1/pleroma/chats')
  //         .reply(200, [
  //           chat,
  //         ], {
  //           link: '<https://example.com/api/v1/pleroma/chats?since_id=2>; rel="prev"',
  //         });
  //     });
  //   });

  //   it('is successful', async () => {
  //     const { result } = renderHook(() => useChats().chatsQuery, undefined, store);

  //     await waitFor(() => expect(result.current.isFetching).toBe(false));

  //     expect(result.current.data?.length).toBe(1);
  //   });
  // });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/pleroma/chats').networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(() => useChats().chatsQuery);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.error).toBeDefined();
    });
  });
});

describe('useChat()', () => {
  const relationshipId = '123';
  let store: Store;

  beforeEach(() => {
    const state = rootState;
    store = createTestStore(state);

    queryClient.clear();
  });

  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}`).reply(200, chat);
        mock
          .onGet(`/api/v1/accounts/relationships?id[]=${chat.account.id}`)
          .reply(200, [buildRelationship({ id: relationshipId, blocked_by: true })]);
      });
    });

    it('is successful', async () => {
      expect(store.getState().relationships.getIn([relationshipId, 'blocked_by'])).toBeUndefined();

      const { result } = renderHook(() => useChat(chat.id), undefined, store);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(store.getState().relationships.getIn([relationshipId, 'id'])).toBe(relationshipId);
      expect(store.getState().relationships.getIn([relationshipId, 'blocked_by'])).toBe(true);
      expect(result.current.data.id).toBe(chat.id);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}`).networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(() => useChat(chat.id));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.error).toBeDefined();
    });
  });
});

describe('useChatActions', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  describe('markChatAsRead()', () => {
    const nextUnreadCount = 5;

    beforeEach(() => {
      __stub((mock) => {
        mock
          .onPost(`/api/v1/pleroma/chats/${chat.id}/read`, { last_read_id: '2' })
          .reply(200, { ...chat, unread: nextUnreadCount });
      });
    });

    it('updates the queryCache', async() => {
      const initialQueryData = {
        pages: [
          { result: [chat], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };
      const initialFlattenedData = flattenPages(initialQueryData);
      expect(sumBy(initialFlattenedData, (chat: IChat) => chat.unread)).toBe(0);

      queryClient.setQueryData(['chats', 'search'], initialQueryData);

      const { result } = renderHook(() => useChatActions(chat.id).markChatAsRead('2'));

      await waitFor(() => {
        expect(result.current).resolves.toBeDefined();
      });

      const nextQueryData = queryClient.getQueryData(['chats', 'search']);
      const nextFlattenedData = flattenPages(nextQueryData as any);
      expect(sumBy(nextFlattenedData as any, (chat: IChat) => chat.unread)).toBe(nextUnreadCount);
    });
  });

  describe('createChatMessage()', () => {
    beforeEach(() => {
      const initialQueryData = {
        pages: [
          { result: [buildChatMessage('1')], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(ChatKeys.chatMessages(chat.id), initialQueryData);

      __stub((mock) => {
        mock
          .onPost(`/api/v1/pleroma/chats/${chat.id}/messages`)
          .reply(200, { hello: 'world' });
      });
    });

    it('creates a chat message', async() => {
      const { result } = renderHook(() => {
        const { createChatMessage } = useChatActions(chat.id);

        useEffect(() => {
          createChatMessage.mutate({ chatId: chat.id, content: 'hello' });
        }, []);

        return createChatMessage;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.data).toEqual({ hello: 'world' });
    });
  });
});
