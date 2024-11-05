import { Record as ImmutableRecord } from 'immutable';

import { TRENDING_STATUSES_FETCH_REQUEST, TRENDING_STATUSES_FETCH_SUCCESS, type TrendingStatusesAction } from 'pl-fe/actions/trending-statuses';

import type { Status } from 'pl-api';

const ReducerRecord = ImmutableRecord({
  items: Array<string>(),
  isLoading: false,
});

type State = ReturnType<typeof ReducerRecord>;

const toIds = (items: Array<Status>) => items.map(item => item.id);

const importStatuses = (state: State, statuses: Array<Status>) =>
  state.withMutations(state => {
    state.set('items', toIds(statuses));
    state.set('isLoading', false);
  });

const trending_statuses = (state: State = ReducerRecord(), action: TrendingStatusesAction) => {
  switch (action.type) {
    case TRENDING_STATUSES_FETCH_REQUEST:
      return state.set('isLoading', true);
    case TRENDING_STATUSES_FETCH_SUCCESS:
      return importStatuses(state, action.statuses);
    default:
      return state;
  }
};

export { trending_statuses as default };
