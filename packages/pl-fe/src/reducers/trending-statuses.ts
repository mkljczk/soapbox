import { create } from 'mutative';

import { TRENDING_STATUSES_FETCH_REQUEST, TRENDING_STATUSES_FETCH_SUCCESS, type TrendingStatusesAction } from 'pl-fe/actions/trending-statuses';

import type { Status } from 'pl-api';

interface State {
  items: Array<string>;
  isLoading: boolean;
}

const initialState: State = {
  items: [],
  isLoading: false,
};

const toIds = (items: Array<Status>) => items.map(item => item.id);

const trending_statuses = (state = initialState, action: TrendingStatusesAction) => {
  switch (action.type) {
    case TRENDING_STATUSES_FETCH_REQUEST:
      return create(state, (draft) => {
        draft.isLoading = true;
      });
    case TRENDING_STATUSES_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft.items = toIds(action.statuses);
        draft.isLoading = false;
      });
    default:
      return state;
  }
};

export { trending_statuses as default };
