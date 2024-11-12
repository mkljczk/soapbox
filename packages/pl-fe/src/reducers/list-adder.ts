import { create } from 'mutative';

import {
  LIST_ADDER_RESET,
  LIST_ADDER_SETUP,
  LIST_ADDER_LISTS_FETCH_REQUEST,
  LIST_ADDER_LISTS_FETCH_SUCCESS,
  LIST_ADDER_LISTS_FETCH_FAIL,
  LIST_EDITOR_ADD_SUCCESS,
  LIST_EDITOR_REMOVE_SUCCESS,
} from '../actions/lists';

import type { AnyAction } from 'redux';

interface State {
  accountId: string | null;
  lists: {
    items: Array<string>;
    loaded: boolean;
    isLoading: boolean;
  };
}

const initialState: State = {
  accountId: null,
  lists: {
    items: [],
    loaded: false,
    isLoading: false,
  },
};

const listAdderReducer = (state: State = initialState, action: AnyAction): State => {
  switch (action.type) {
    case LIST_ADDER_RESET:
      return initialState;
    case LIST_ADDER_SETUP:
      return create(state, (draft) => {
        draft.accountId = action.account.id;
      });
    case LIST_ADDER_LISTS_FETCH_REQUEST:
      return create(state, (draft) => {
        draft.lists.isLoading = true;
      });
    case LIST_ADDER_LISTS_FETCH_FAIL:
      return create(state, (draft) => {
        draft.lists.isLoading = false;
      });
    case LIST_ADDER_LISTS_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft.lists.isLoading = false;
        draft.lists.loaded = true;
        draft.lists.items = action.lists.map((item: { id: string }) => item.id);
      });
    case LIST_EDITOR_ADD_SUCCESS:
      return create(state, (draft) => {
        draft.lists.items = [action.listId, ...draft.lists.items];
      });
    case LIST_EDITOR_REMOVE_SUCCESS:
      return create(state, (draft) => {
        draft.lists.items = draft.lists.items.filter(id => id !== action.listId);
      });
    default:
      return state;
  }
};

export { listAdderReducer as default };
