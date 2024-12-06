import pick from 'lodash/pick';
import { create } from 'mutative';

import {
  CONVERSATIONS_MOUNT,
  CONVERSATIONS_UNMOUNT,
  CONVERSATIONS_FETCH_REQUEST,
  CONVERSATIONS_FETCH_SUCCESS,
  CONVERSATIONS_FETCH_FAIL,
  CONVERSATIONS_UPDATE,
  CONVERSATIONS_READ,
  type ConversationsAction,
} from '../actions/conversations';
import { compareDate } from '../utils/comparators';

import type { Conversation, PaginatedResponse } from 'pl-api';

interface State {
  items: Array<MinifiedConversation>;
  isLoading: boolean;
  hasMore: boolean;
  next: (() => Promise<PaginatedResponse<Conversation>>) | null;
  mounted: number;
}

const initialState: State = {
  items: [],
  isLoading: false,
  hasMore: true,
  next: null,
  mounted: 0,
};

const minifyConversation = (conversation: Conversation) => ({
  ...(pick(conversation, ['id', 'unread'])),
  accounts: conversation.accounts.map(a => a.id),
  last_status: conversation.last_status?.id || null,
  last_status_created_at: conversation.last_status?.created_at || null,
});

type MinifiedConversation = ReturnType<typeof minifyConversation>;

const updateConversation = (state: State, item: Conversation) => {
  const index = state.items.findIndex(x => x.id === item.id);
  const newItem = minifyConversation(item);

  if (index === -1) {
    state.items = [newItem, ...state.items];
  } else {
    state.items[index] = newItem;
  }
};

const expandNormalizedConversations = (state: State, conversations: Conversation[], next: (() => Promise<PaginatedResponse<Conversation>>) | null, isLoadingRecent?: boolean) => {
  let items = conversations.map(minifyConversation);

  if (items.length) {
    let list = state.items.map(oldItem => {
      const newItemIndex = items.findIndex(x => x.id === oldItem.id);

      if (newItemIndex === -1) {
        return oldItem;
      }

      const newItem = items[newItemIndex];
      items = items.filter((_, index) => index !== newItemIndex);

      return newItem!;
    });

    list = list.concat(items);

    state.items = list.toSorted((a, b) => {
      if (a.last_status_created_at === null || b.last_status_created_at === null) {
        return -1;
      }

      return compareDate(a.last_status_created_at, b.last_status_created_at);
    });
  }

  if (!next && !isLoadingRecent) {
    state.hasMore = false;
  }

  state.next = next;
  state.isLoading = false;
};

const conversations = (state = initialState, action: ConversationsAction): State => {
  switch (action.type) {
    case CONVERSATIONS_FETCH_REQUEST:
      return create(state, (draft) => {
        draft.isLoading = true;
      });
    case CONVERSATIONS_FETCH_FAIL:
      return create(state, (draft) => {
        draft.isLoading = false;
      });
    case CONVERSATIONS_FETCH_SUCCESS:
      return create(state, (draft) => expandNormalizedConversations(draft, action.conversations, action.next, action.isLoadingRecent));
    case CONVERSATIONS_UPDATE:
      return create(state, (draft) => updateConversation(state, action.conversation));
    case CONVERSATIONS_MOUNT:
      return create(state, (draft) => {
        draft.mounted += 1;
      });
    case CONVERSATIONS_UNMOUNT:
      return create(state, (draft) => {
        draft.mounted -= 1;
      });
    case CONVERSATIONS_READ:
      return create(state, (draft) => {
        state.items = state.items.map(item => {
          if (item.id === action.conversationId) {
            return { ...item, unread: false };
          }

          return item;
        });
      });
    default:
      return state;
  }
};

export { conversations as default };
