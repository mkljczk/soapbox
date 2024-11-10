import { create } from 'mutative';

import {
  LIST_CREATE_REQUEST,
  LIST_CREATE_FAIL,
  LIST_CREATE_SUCCESS,
  LIST_UPDATE_REQUEST,
  LIST_UPDATE_FAIL,
  LIST_UPDATE_SUCCESS,
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  LIST_EDITOR_TITLE_CHANGE,
  LIST_ACCOUNTS_FETCH_REQUEST,
  LIST_ACCOUNTS_FETCH_SUCCESS,
  LIST_ACCOUNTS_FETCH_FAIL,
  LIST_EDITOR_SUGGESTIONS_READY,
  LIST_EDITOR_SUGGESTIONS_CLEAR,
  LIST_EDITOR_SUGGESTIONS_CHANGE,
  LIST_EDITOR_ADD_SUCCESS,
  LIST_EDITOR_REMOVE_SUCCESS,
} from '../actions/lists';

import type { AnyAction } from 'redux';

interface State {
  listId: string | null;
  isSubmitting: boolean;
  isChanged: boolean;
  title: string;

  accounts: {
    items: Array<string>;
    loaded: boolean;
    isLoading: boolean;
  };

  suggestions: {
    value: string;
    items: Array<string>;
  };
}

const initialState: State = {
  listId: null,
  isSubmitting: false,
  isChanged: false,
  title: '',

  accounts: {
    items: [],
    loaded: false,
    isLoading: false,
  },

  suggestions: {
    value: '',
    items: [],
  },
};

const listEditorReducer = (state: State = initialState, action: AnyAction): State => {
  switch (action.type) {
    case LIST_EDITOR_RESET:
      return initialState;
    case LIST_EDITOR_SETUP:
      return create(state, (draft) => {
        draft.listId = action.list.id;
        draft.title = action.list.title;
        draft.isSubmitting = false;
      });
    case LIST_EDITOR_TITLE_CHANGE:
      return create(state, (draft) => {
        draft.title = action.value;
        draft.isChanged = true;
      });
    case LIST_CREATE_REQUEST:
    case LIST_UPDATE_REQUEST:
      return create(state, (draft) => {
        draft.isSubmitting = true;
        draft.isChanged = false;
      });
    case LIST_CREATE_FAIL:
    case LIST_UPDATE_FAIL:
      return create(state, (draft) => {
        draft.isSubmitting = false;
      });
    case LIST_CREATE_SUCCESS:
    case LIST_UPDATE_SUCCESS:
      return create(state, (draft) => {
        draft.isSubmitting = false;
        draft.listId = action.list.id;
      });
    case LIST_ACCOUNTS_FETCH_REQUEST:
      return create(state, (draft) => {
        draft.accounts.isLoading = true;
      });
    case LIST_ACCOUNTS_FETCH_FAIL:
      return create(state, (draft) => {
        draft.accounts.isLoading = false;
      });
    case LIST_ACCOUNTS_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft.accounts.isLoading = false;
        draft.accounts.loaded = true;
        draft.accounts.items = action.accounts.map((item: { id: string }) => item.id);
      });
    case LIST_EDITOR_SUGGESTIONS_CHANGE:
      return create(state, (draft) => {
        draft.suggestions.value = action.value;
      });
    case LIST_EDITOR_SUGGESTIONS_READY:
      return create(state, (draft) => {
        draft.suggestions.items = action.accounts.map((item: { id: string }) => item.id);
      });
    case LIST_EDITOR_SUGGESTIONS_CLEAR:
      return create(state, (draft) => {
        draft.suggestions.items = [];
        draft.suggestions.value = '';
      });
    case LIST_EDITOR_ADD_SUCCESS:
      return create(state, (draft) => {
        draft.accounts.items = [action.accountId, ...draft.accounts.items];
      });
    case LIST_EDITOR_REMOVE_SUCCESS:
      return create(state, (draft) => {
        draft.accounts.items = draft.accounts.items.filter(id => id !== action.accoundId);
      });
    default:
      return state;
  }
};

export { listEditorReducer as default };
