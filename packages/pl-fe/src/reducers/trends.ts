import { create } from 'mutative';

import { TRENDS_FETCH_SUCCESS, type TrendsAction } from '../actions/trends';

import type { Tag } from 'pl-api';

interface State {
  items: Array<Tag>;
  isLoading: boolean;
}

const initialState: State = {
  items: [],
  isLoading: false,
};

const trendsReducer = (state = initialState, action: TrendsAction) => {
  switch (action.type) {
    case TRENDS_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft.items = action.tags;
        draft.isLoading = false;
      });
    default:
      return state;
  }
};

export { trendsReducer as default };
