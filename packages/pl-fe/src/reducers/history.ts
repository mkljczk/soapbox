import { Map as ImmutableMap, Record as ImmutableRecord } from 'immutable';

import { HISTORY_FETCH_REQUEST, HISTORY_FETCH_SUCCESS, HISTORY_FETCH_FAIL, type HistoryAction } from 'pl-fe/actions/history';

import type { StatusEdit } from 'pl-api';

const HistoryRecord = ImmutableRecord({
  loading: false,
  items: [] as Array<ReturnType<typeof minifyStatusEdit>>,
});

type State = ImmutableMap<string, ReturnType<typeof HistoryRecord>>;

const initialState: State = ImmutableMap();

const minifyStatusEdit = ({ account, ...statusEdit }: StatusEdit, i: number) => ({
  ...statusEdit, account_id: account.id, original: i === 0,
});

const history = (state: State = initialState, action: HistoryAction) => {
  switch (action.type) {
    case HISTORY_FETCH_REQUEST:
      return state.update(action.statusId, HistoryRecord(), history => history!.withMutations(map => {
        map.set('loading', true);
        map.set('items', []);
      }));
    case HISTORY_FETCH_SUCCESS:
      return state.update(action.statusId, HistoryRecord(), history => history!.withMutations(map => {
        map.set('loading', false);
        map.set('items', action.history.map(minifyStatusEdit).toReversed());
      }));
    case HISTORY_FETCH_FAIL:
      return state.update(action.statusId, HistoryRecord(), history => history!.set('loading', false));
    default:
      return state;
  }
};

export { history as default };
