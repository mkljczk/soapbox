import { create } from 'mutative';

import {
  FOLLOW_REQUESTS_FETCH_SUCCESS,
  FOLLOW_REQUESTS_EXPAND_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
  PINNED_ACCOUNTS_FETCH_SUCCESS,
  BIRTHDAY_REMINDERS_FETCH_SUCCESS,
  type AccountsAction,
} from 'pl-fe/actions/accounts';
import {
  EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS,
  type EventsAction,
} from 'pl-fe/actions/events';
import { FAMILIAR_FOLLOWERS_FETCH_SUCCESS, type FamiliarFollowersAction } from 'pl-fe/actions/familiar-followers';
import {
  GROUP_BLOCKS_FETCH_REQUEST,
  GROUP_BLOCKS_FETCH_SUCCESS,
  GROUP_BLOCKS_FETCH_FAIL,
  GROUP_UNBLOCK_SUCCESS,
  type GroupsAction,
} from 'pl-fe/actions/groups';
import {
  REBLOGS_FETCH_SUCCESS,
  REBLOGS_EXPAND_SUCCESS,
  FAVOURITES_FETCH_SUCCESS,
  FAVOURITES_EXPAND_SUCCESS,
  DISLIKES_FETCH_SUCCESS,
  REACTIONS_FETCH_SUCCESS,
  type InteractionsAction,
} from 'pl-fe/actions/interactions';
import { NOTIFICATIONS_UPDATE, type NotificationsAction } from 'pl-fe/actions/notifications';

import type { Account, NotificationGroup, PaginatedResponse } from 'pl-api';

interface List {
  next: (() => Promise<PaginatedResponse<Account>>) | null;
  items: Array<string>;
  isLoading: boolean;
}

interface Reaction {
  accounts: Array<string>;
  count: number | null;
  name: string;
  url: string | undefined;
}

interface ReactionList {
  next: (() => Promise<PaginatedResponse<Reaction>>) | null;
  items: Array<Reaction>;
  isLoading: boolean;
}

interface ParticipationRequest {
  account: string;
  participation_message: string | null;
}

interface ParticipationRequestList {
  next: (() => Promise<PaginatedResponse<any>>) | null;
  items: Array<ParticipationRequest>;
  isLoading: boolean;
}

type ListKey = 'follow_requests';
type NestedListKey = 'reblogged_by' | 'favourited_by' | 'disliked_by' | 'pinned' | 'birthday_reminders' | 'familiar_followers' | 'event_participations' | 'membership_requests' | 'group_blocks';

type State = Record<ListKey, List> & Record<NestedListKey, Record<string, List>> & {
  reactions: Record<string, ReactionList>;
  event_participation_requests: Record<string, ParticipationRequestList>;
};

const initialState: State = {
  reblogged_by: {},
  favourited_by: {},
  disliked_by: {},
  reactions: {},
  follow_requests: { next: null, items: [], isLoading: false },
  pinned: {},
  birthday_reminders: {},
  familiar_followers: {},
  event_participations: {},
  event_participation_requests: {},
  membership_requests: {},
  group_blocks: {},
};

type NestedListPath = [NestedListKey, string];
type ListPath = [ListKey];

const normalizeList = (state: State, path: NestedListPath | ListPath, accounts: Array<Pick<Account, 'id'>>, next: (() => Promise<PaginatedResponse<any>>) | null = null) =>
  create(state, (draft) => {
    let list: List;

    if (path.length === 1) {
      list = draft[path[0]];
    } else {
      list = draft[path[0]][path[1]];
    }

    const newList = { ...list, next, items: accounts.map(item => item.id), isLoading: false };

    if (path.length === 1) {
      draft[path[0]] = newList;
    } else {
      draft[path[0]][path[1]] = newList;
    }
  });

const appendToList = (state: State, path: NestedListPath | ListPath, accounts: Array<Pick<Account, 'id'>>, next: (() => any) | null = null) =>
  create(state, (draft) => {
    let list: List;

    if (path.length === 1) {
      list = draft[path[0]];
    } else {
      list = draft[path[0]][path[1]];
    }

    list.next = next;
    list.isLoading = false;
    list.items = [...new Set([...list.items, ...accounts.map(item => item.id)])];
  });

const removeFromList = (state: State, path: NestedListPath | ListPath, accountId: string) =>
  create(state, (draft) => {
    let list: List;

    if (path.length === 1) {
      list = draft[path[0]];
    } else {
      list = draft[path[0]][path[1]];
    }

    list.items = list.items.filter(item => item !== accountId);
  });

const normalizeFollowRequest = (state: State, notification: NotificationGroup) =>
  create(state, (draft) => {
    draft.follow_requests.items = [...new Set([...notification.sample_account_ids, ...draft.follow_requests.items])];
  });

const userLists = (state = initialState, action: AccountsAction | EventsAction | FamiliarFollowersAction | GroupsAction | InteractionsAction | NotificationsAction): State => {
  switch (action.type) {
    case REBLOGS_FETCH_SUCCESS:
      return normalizeList(state, ['reblogged_by', action.statusId], action.accounts, action.next);
    case REBLOGS_EXPAND_SUCCESS:
      return appendToList(state, ['reblogged_by', action.statusId], action.accounts, action.next);
    case FAVOURITES_FETCH_SUCCESS:
      return normalizeList(state, ['favourited_by', action.statusId], action.accounts, action.next);
    case FAVOURITES_EXPAND_SUCCESS:
      return appendToList(state, ['favourited_by', action.statusId], action.accounts, action.next);
    case DISLIKES_FETCH_SUCCESS:
      return normalizeList(state, ['disliked_by', action.statusId], action.accounts);
    case REACTIONS_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft.reactions[action.statusId] = {
          items: action.reactions.map((reaction) => ({ ...reaction, accounts: reaction.accounts.map(({ id }) => id) })),
          next: null,
          isLoading: false,
        };
      });
    case NOTIFICATIONS_UPDATE:
      return action.notification.type === 'follow_request' ? normalizeFollowRequest(state, action.notification) : state;
    case FOLLOW_REQUESTS_FETCH_SUCCESS:
      return normalizeList(state, ['follow_requests'], action.accounts, action.next);
    case FOLLOW_REQUESTS_EXPAND_SUCCESS:
      return appendToList(state, ['follow_requests'], action.accounts, action.next);
    case FOLLOW_REQUEST_AUTHORIZE_SUCCESS:
    case FOLLOW_REQUEST_REJECT_SUCCESS:
      return removeFromList(state, ['follow_requests'], action.accountId);
    case PINNED_ACCOUNTS_FETCH_SUCCESS:
      return normalizeList(state, ['pinned', action.accountId], action.accounts, action.next);
    case BIRTHDAY_REMINDERS_FETCH_SUCCESS:
      return normalizeList(state, ['birthday_reminders', action.accountId], action.accounts);
    case FAMILIAR_FOLLOWERS_FETCH_SUCCESS:
      return normalizeList(state, ['familiar_followers', action.accountId], action.accounts);
    case EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft.event_participation_requests[action.statusId] = {
          next: action.next,
          items: action.participations.map(({ account, participation_message }) => ({
            account: account.id,
            participation_message,
          })),
          isLoading: false,
        };
      });
    case EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS:
      return create(state, (draft) => {
        const list = draft.event_participation_requests[action.statusId];
        list.next = action.next;
        list.items = [...list.items, ...action.participations.map(({ account, participation_message }) => ({
          account: account.id,
          participation_message,
        }))];
        list.isLoading = false;
      });
    case EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS:
    case EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS:
      return create(state, (draft) => {
        const list = draft.event_participation_requests[action.statusId];
        if (list.items) list.items = list.items.filter(item => item.account !== action.accountId);
      });
    case GROUP_BLOCKS_FETCH_SUCCESS:
      return normalizeList(state, ['group_blocks', action.groupId], action.accounts, action.next);
    case GROUP_BLOCKS_FETCH_REQUEST:
      return create(state, (draft) => {
        draft.group_blocks[action.groupId] = {
          items: [],
          next: null,
          isLoading: true,
        };
      });
    case GROUP_BLOCKS_FETCH_FAIL:
      return create(state, (draft) => {
        draft.group_blocks[action.groupId] = {
          items: [],
          next: null,
          isLoading: false,
        };
      });
    case GROUP_UNBLOCK_SUCCESS:
      return create(state, (draft) => {
        const list = draft.group_blocks[action.groupId];
        if (list.items) list.items = list.items.filter(item => item !== action.accountId);
      });
    default:
      return state;
  }
};

export {
  userLists as default,
};
