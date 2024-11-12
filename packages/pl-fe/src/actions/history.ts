import { importEntities } from 'pl-hooks';

import { getClient } from 'pl-fe/api';

import type { StatusEdit } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const HISTORY_FETCH_REQUEST = 'HISTORY_FETCH_REQUEST' as const;
const HISTORY_FETCH_SUCCESS = 'HISTORY_FETCH_SUCCESS' as const;
const HISTORY_FETCH_FAIL = 'HISTORY_FETCH_FAIL' as const;

const fetchHistory = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const loading = getState().history[statusId]?.loading;

    if (loading) return;

    dispatch(fetchHistoryRequest(statusId));

    return getClient(getState()).statuses.getStatusHistory(statusId).then(data => {
      importEntities({ accounts: data.map((x) => x.account) });
      dispatch(fetchHistorySuccess(statusId, data));
    }).catch(error => dispatch(fetchHistoryFail(statusId, error)));
  };

const fetchHistoryRequest = (statusId: string) => ({
  type: HISTORY_FETCH_REQUEST,
  statusId,
});

const fetchHistorySuccess = (statusId: string, history: Array<StatusEdit>) => ({
  type: HISTORY_FETCH_SUCCESS,
  statusId,
  history,
});

const fetchHistoryFail = (statusId: string, error: unknown) => ({
  type: HISTORY_FETCH_FAIL,
  statusId,
  error,
});

type HistoryAction = ReturnType<typeof fetchHistoryRequest> | ReturnType<typeof fetchHistorySuccess> | ReturnType<typeof fetchHistoryFail>;

export {
  HISTORY_FETCH_REQUEST,
  HISTORY_FETCH_SUCCESS,
  HISTORY_FETCH_FAIL,
  fetchHistory,
  fetchHistoryRequest,
  fetchHistorySuccess,
  fetchHistoryFail,
  type HistoryAction,
};
