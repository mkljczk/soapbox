import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import { importEntities } from './importer';

import type { PaginatedResponse, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const PINNED_STATUSES_FETCH_SUCCESS = 'PINNED_STATUSES_FETCH_SUCCESS' as const;

const fetchPinnedStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;
    const me = getState().me;

    return getClient(getState()).accounts.getAccountStatuses(me as string, { pinned: true }).then(response => {
      dispatch(importEntities({ statuses: response.items }));
      dispatch(fetchPinnedStatusesSuccess(response.items, response.next));
    });
  };

const fetchPinnedStatusesSuccess = (statuses: Array<Status>, next: (() => Promise<PaginatedResponse<Status>>) | null) => ({
  type: PINNED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
});

type PinStatusesAction = ReturnType<typeof fetchPinnedStatusesSuccess>;

export {
  PINNED_STATUSES_FETCH_SUCCESS,
  fetchPinnedStatuses,
  type PinStatusesAction,
};
