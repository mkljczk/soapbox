import { create } from 'mutative';

import {
  LIST_FETCH_SUCCESS,
  LIST_FETCH_FAIL,
  LISTS_FETCH_SUCCESS,
  LIST_CREATE_SUCCESS,
  LIST_UPDATE_SUCCESS,
  LIST_DELETE_SUCCESS,
  type ListsAction,
} from 'pl-fe/actions/lists';

import type { List } from 'pl-api';

type State = Record<string, List | false>;

const initialState: State = {};

const importList = (state: State, list: List) => {
  state[list.id] = list;
};

const importLists = (state: State, lists: Array<List>) => {
  lists.forEach(list => importList(state, list));
};

const lists = (state: State = initialState, action: ListsAction) => {
  switch (action.type) {
    case LIST_FETCH_SUCCESS:
    case LIST_CREATE_SUCCESS:
    case LIST_UPDATE_SUCCESS:
      return create(state, (draft) => {
        importList(draft, action.list);
      });
    case LISTS_FETCH_SUCCESS:
      return create(state, (draft) => {
        importLists(draft, action.lists);
      });
    case LIST_DELETE_SUCCESS:
    case LIST_FETCH_FAIL:
      return create(state, (draft) => {
        draft[action.listId] = false;
      });
    default:
      return state;
  }
};

export { lists as default };
