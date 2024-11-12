import { importEntities } from 'pl-hooks';

import { getClient } from 'pl-fe/api';
import { isLoggedIn } from 'pl-fe/utils/auth';

import type { Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const PINNED_STATUSES_FETCH_REQUEST = 'PINNED_STATUSES_FETCH_REQUEST' as const;
const PINNED_STATUSES_FETCH_SUCCESS = 'PINNED_STATUSES_FETCH_SUCCESS' as const;
const PINNED_STATUSES_FETCH_FAIL = 'PINNED_STATUSES_FETCH_FAIL' as const;

const fetchPinnedStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;
    const me = getState().me;

    dispatch(fetchPinnedStatusesRequest());

    return getClient(getState()).accounts.getAccountStatuses(me as string, { pinned: true }).then(response => {
      importEntities({ statuses: response.items });
      dispatch(fetchPinnedStatusesSuccess(response.items, null));
    }).catch(error => {
      dispatch(fetchPinnedStatusesFail(error));
    });
  };

const fetchPinnedStatusesRequest = () => ({
  type: PINNED_STATUSES_FETCH_REQUEST,
});

const fetchPinnedStatusesSuccess = (statuses: Array<Status>, next: string | null) => ({
  type: PINNED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
});

const fetchPinnedStatusesFail = (error: unknown) => ({
  type: PINNED_STATUSES_FETCH_FAIL,
  error,
});

type PinStatusesAction =
  ReturnType<typeof fetchPinnedStatusesRequest>
  | ReturnType<typeof fetchPinnedStatusesSuccess>
  | ReturnType<typeof fetchPinnedStatusesFail>;

export {
  PINNED_STATUSES_FETCH_REQUEST,
  PINNED_STATUSES_FETCH_SUCCESS,
  PINNED_STATUSES_FETCH_FAIL,
  fetchPinnedStatuses,
  fetchPinnedStatusesRequest,
  fetchPinnedStatusesSuccess,
  fetchPinnedStatusesFail,
  type PinStatusesAction,
};
