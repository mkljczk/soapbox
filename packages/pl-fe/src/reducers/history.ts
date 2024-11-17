import { create } from 'mutative';

import { HISTORY_FETCH_REQUEST, HISTORY_FETCH_SUCCESS, HISTORY_FETCH_FAIL, type HistoryAction } from 'pl-fe/actions/history';

import type { StatusEdit } from 'pl-api';

interface History {
  loading: boolean;
  items: Array<ReturnType<typeof minifyStatusEdit>>;
}

type State = Record<string, History>;

const initialState: State = {};

const minifyStatusEdit = ({ account, ...statusEdit }: StatusEdit, i: number) => ({
  ...statusEdit, account_id: account.id, original: i === 0,
});

const history = (state: State = initialState, action: HistoryAction) => {
  switch (action.type) {
    case HISTORY_FETCH_REQUEST:
      return create(state, (draft) => {
        draft[action.statusId] = {
          loading: true,
          items: [],
        };
      });
    case HISTORY_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft[action.statusId] = {
          loading: false,
          items: action.history.map(minifyStatusEdit).toReversed(),
        };
      });
    case HISTORY_FETCH_FAIL:
      return create(state, (draft) => {
        if (draft[action.statusId]) draft[action.statusId].loading = false;
      });
    default:
      return state;
  }
};

export { history as default };
