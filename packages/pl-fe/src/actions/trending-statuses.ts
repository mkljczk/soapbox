import { getClient } from '../api';

import { importEntities } from './importer';

import type { AppDispatch, RootState } from 'pl-fe/store';

const TRENDING_STATUSES_FETCH_REQUEST = 'TRENDING_STATUSES_FETCH_REQUEST' as const;
const TRENDING_STATUSES_FETCH_SUCCESS = 'TRENDING_STATUSES_FETCH_SUCCESS' as const;
const TRENDING_STATUSES_FETCH_FAIL = 'TRENDING_STATUSES_FETCH_FAIL' as const;

const fetchTrendingStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const client = getClient(state);

    if (!client.features.trendingStatuses) return;

    dispatch({ type: TRENDING_STATUSES_FETCH_REQUEST });

    return client.trends.getTrendingStatuses().then((statuses) => {
      dispatch(importEntities({ statuses }));
      dispatch({ type: TRENDING_STATUSES_FETCH_SUCCESS, statuses });
      return statuses;
    }).catch(error => {
      dispatch({ type: TRENDING_STATUSES_FETCH_FAIL, error });
    });
  };

export {
  TRENDING_STATUSES_FETCH_REQUEST,
  TRENDING_STATUSES_FETCH_SUCCESS,
  TRENDING_STATUSES_FETCH_FAIL,
  fetchTrendingStatuses,
};
