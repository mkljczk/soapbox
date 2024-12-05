import { create } from 'mutative';

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

type NestedListKey = 'group_blocks';

type State = Record<NestedListKey, Record<string, List>>;

const initialState: State = {
  group_blocks: {},
};

type NestedListPath = [NestedListKey, string];

const normalizeList = (state: State, path: NestedListPath, accounts: Array<Pick<Account, 'id'>>, next: (() => Promise<PaginatedResponse<any>>) | null = null) =>
  create(state, (draft) => {
    const list = draft[path[0]][path[1]];
    const newList = { ...list, next, items: accounts.map(item => item.id), isLoading: false };
    draft[path[0]][path[1]] = newList;
  });

const userLists = (state = initialState, action: GroupsAction): State => {
  switch (action.type) {
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
