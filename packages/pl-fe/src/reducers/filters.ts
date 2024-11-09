import { FILTERS_FETCH_SUCCESS } from '../actions/filters';

import type { Filter } from 'pl-api';
import type { AnyAction } from 'redux';

type State = Array<Filter>;

const filters = (state: State = [], action: AnyAction): State => {
  switch (action.type) {
    case FILTERS_FETCH_SUCCESS:
      return action.filters;
    default:
      return state;
  }
};

export { filters as default };
