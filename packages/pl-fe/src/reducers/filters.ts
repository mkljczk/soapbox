import { FILTERS_FETCH_SUCCESS, type FiltersAction } from '../actions/filters';

import type { Filter } from 'pl-api';

type State = Array<Filter>;

const filters = (state: State = [], action: FiltersAction): State => {
  switch (action.type) {
    case FILTERS_FETCH_SUCCESS:
      return action.filters;
    default:
      return state;
  }
};

export { filters as default };
