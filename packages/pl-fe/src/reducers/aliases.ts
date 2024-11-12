import { create } from 'mutative';

import {
  ALIASES_SUGGESTIONS_READY,
  ALIASES_SUGGESTIONS_CLEAR,
  ALIASES_SUGGESTIONS_CHANGE,
  ALIASES_FETCH_SUCCESS,
  AliasesAction,
} from '../actions/aliases';

interface State {
  aliases: {
    items: Array<string>;
    loaded: boolean;
  };
  suggestions: {
    items: Array<string>;
    value: string;
    loaded: boolean;
  };
}

const initialState: State = {
  aliases: {
    items: [],
    loaded: false,
  },
  suggestions: {
    items: [],
    value: '',
    loaded: false,
  },
};

const aliasesReducer = (state = initialState, action: AliasesAction): State => {
  switch (action.type) {
    case ALIASES_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft.aliases.items = action.value;
      });
    case ALIASES_SUGGESTIONS_CHANGE:
      return create(state, (draft) => {
        draft.suggestions.value = action.value;
        draft.suggestions.loaded = false;
      });
    case ALIASES_SUGGESTIONS_READY:
      return create(state, (draft) => {
        draft.suggestions.items = action.accounts.map((item) => item.id);
        draft.suggestions.loaded = true;
      });
    case ALIASES_SUGGESTIONS_CLEAR:
      return create(state, (draft) => {
        draft.suggestions.items = [];
        draft.suggestions.value = '';
        draft.suggestions.loaded = false;
      });
    default:
      return state;
  }
};

export { aliasesReducer as default };
