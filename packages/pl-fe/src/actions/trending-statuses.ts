import { importEntities } from 'pl-hooks';

import { getClient } from 'pl-fe/api';

import type { Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const TRENDING_STATUSES_FETCH_REQUEST = 'TRENDING_STATUSES_FETCH_REQUEST' as const;
const TRENDING_STATUSES_FETCH_SUCCESS = 'TRENDING_STATUSES_FETCH_SUCCESS' as const;
const TRENDING_STATUSES_FETCH_FAIL = 'TRENDING_STATUSES_FETCH_FAIL' as const;

interface TrendingStatusesFetchRequestAction {
  type: typeof TRENDING_STATUSES_FETCH_REQUEST;
}

interface TrendingStatusesFetchSuccessAction {
  type: typeof TRENDING_STATUSES_FETCH_SUCCESS;
  statuses: Array<Status>;
}

interface TrendingStatusesFetchFailAction {
  type: typeof TRENDING_STATUSES_FETCH_FAIL;
  error: any;
}

const fetchTrendingStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const client = getClient(state);

    if (!client.features.trendingStatuses) return;

    dispatch<TrendingStatusesFetchRequestAction>({ type: TRENDING_STATUSES_FETCH_REQUEST });

    return client.trends.getTrendingStatuses().then((statuses) => {
      importEntities({ statuses });
      dispatch<TrendingStatusesFetchSuccessAction>({ type: TRENDING_STATUSES_FETCH_SUCCESS, statuses });
      return statuses;
    }).catch(error => {
      dispatch<TrendingStatusesFetchFailAction>({ type: TRENDING_STATUSES_FETCH_FAIL, error });
    });
  };

type TrendingStatusesAction =
  | TrendingStatusesFetchRequestAction
  | TrendingStatusesFetchSuccessAction
  | TrendingStatusesFetchFailAction;

export {
  TRENDING_STATUSES_FETCH_REQUEST,
  TRENDING_STATUSES_FETCH_SUCCESS,
  TRENDING_STATUSES_FETCH_FAIL,
  fetchTrendingStatuses,
  type TrendingStatusesAction,
};
