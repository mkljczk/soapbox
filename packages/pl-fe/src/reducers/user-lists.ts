import { create } from 'mutative';

import { PINNED_ACCOUNTS_FETCH_SUCCESS, type AccountsAction } from 'pl-fe/actions/accounts';
import { FAMILIAR_FOLLOWERS_FETCH_SUCCESS, type FamiliarFollowersAction } from 'pl-fe/actions/familiar-followers';
import {
  GROUP_BLOCKS_FETCH_REQUEST,
  GROUP_BLOCKS_FETCH_SUCCESS,
  GROUP_BLOCKS_FETCH_FAIL,
  GROUP_UNBLOCK_SUCCESS,
  type GroupsAction,
} from 'pl-fe/actions/groups';

import type { Account, PaginatedResponse } from 'pl-api';

interface List {
  next: (() => Promise<PaginatedResponse<Account>>) | null;
  items: Array<string>;
  isLoading: boolean;
}

type ListKey = 'follow_requests';
type NestedListKey = 'pinned' | 'familiar_followers' | 'membership_requests' | 'group_blocks';

type State = Record<ListKey, List> & Record<NestedListKey, Record<string, List>>;

const initialState: State = {
  follow_requests: { next: null, items: [], isLoading: false },
  pinned: {},
  familiar_followers: {},
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

const userLists = (state = initialState, action: AccountsAction | FamiliarFollowersAction | GroupsAction): State => {
  switch (action.type) {
    case PINNED_ACCOUNTS_FETCH_SUCCESS:
      return normalizeList(state, ['pinned', action.accountId], action.accounts, action.next);
    case FAMILIAR_FOLLOWERS_FETCH_SUCCESS:
      return normalizeList(state, ['familiar_followers', action.accountId], action.accounts);
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
