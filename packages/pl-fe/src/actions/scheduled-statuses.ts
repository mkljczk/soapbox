import { getClient } from '../api';

import type { PaginatedResponse, ScheduledStatus } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const SCHEDULED_STATUSES_FETCH_REQUEST = 'SCHEDULED_STATUSES_FETCH_REQUEST' as const;
const SCHEDULED_STATUSES_FETCH_SUCCESS = 'SCHEDULED_STATUSES_FETCH_SUCCESS' as const;
const SCHEDULED_STATUSES_FETCH_FAIL = 'SCHEDULED_STATUSES_FETCH_FAIL' as const;

const SCHEDULED_STATUSES_EXPAND_REQUEST = 'SCHEDULED_STATUSES_EXPAND_REQUEST' as const;
const SCHEDULED_STATUSES_EXPAND_SUCCESS = 'SCHEDULED_STATUSES_EXPAND_SUCCESS' as const;
const SCHEDULED_STATUSES_EXPAND_FAIL = 'SCHEDULED_STATUSES_EXPAND_FAIL' as const;

const SCHEDULED_STATUS_CANCEL_REQUEST = 'SCHEDULED_STATUS_CANCEL_REQUEST' as const;
const SCHEDULED_STATUS_CANCEL_SUCCESS = 'SCHEDULED_STATUS_CANCEL_SUCCESS' as const;
const SCHEDULED_STATUS_CANCEL_FAIL = 'SCHEDULED_STATUS_CANCEL_FAIL' as const;

const fetchScheduledStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    if (state.status_lists.scheduled_statuses?.isLoading) {
      return;
    }

    const features = state.auth.client.features;

    if (!features.scheduledStatuses) return;

    dispatch(fetchScheduledStatusesRequest());

    return getClient(getState()).scheduledStatuses.getScheduledStatuses().then(({ next, items }) => {
      dispatch(fetchScheduledStatusesSuccess(items, next));
    }).catch(error => {
      dispatch(fetchScheduledStatusesFail(error));
    });
  };

interface ScheduledStatusCancelRequestAction {
  type: typeof SCHEDULED_STATUS_CANCEL_REQUEST;
  statusId: string;
}

interface ScheduledStatusCancelSuccessAction {
  type: typeof SCHEDULED_STATUS_CANCEL_SUCCESS;
  statusId: string;
}

interface ScheduledStatusCancelFailAction {
  type: typeof SCHEDULED_STATUS_CANCEL_FAIL;
  statusId: string;
  error: unknown;
}

const cancelScheduledStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<ScheduledStatusCancelRequestAction>({ type: SCHEDULED_STATUS_CANCEL_REQUEST, statusId });
    return getClient(getState()).scheduledStatuses.cancelScheduledStatus(statusId).then(() => {
      dispatch<ScheduledStatusCancelSuccessAction>({ type: SCHEDULED_STATUS_CANCEL_SUCCESS, statusId });
    }).catch(error => {
      dispatch<ScheduledStatusCancelFailAction>({ type: SCHEDULED_STATUS_CANCEL_FAIL, statusId, error });
    });
  };

const fetchScheduledStatusesRequest = () => ({
  type: SCHEDULED_STATUSES_FETCH_REQUEST,
});

const fetchScheduledStatusesSuccess = (statuses: Array<ScheduledStatus>, next: (() => Promise<PaginatedResponse<ScheduledStatus>>) | null) => ({
  type: SCHEDULED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
});

const fetchScheduledStatusesFail = (error: unknown) => ({
  type: SCHEDULED_STATUSES_FETCH_FAIL,
  error,
});

const expandScheduledStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const next = getState().status_lists.scheduled_statuses?.next as any as () => Promise<PaginatedResponse<ScheduledStatus>> || null;

    if (next === null || getState().status_lists.scheduled_statuses?.isLoading) {
      return;
    }

    dispatch(expandScheduledStatusesRequest());

    next().then(response => {
      dispatch(expandScheduledStatusesSuccess(response.items, response.next));
    }).catch(error => {
      dispatch(expandScheduledStatusesFail(error));
    });
  };

const expandScheduledStatusesRequest = () => ({
  type: SCHEDULED_STATUSES_EXPAND_REQUEST,
});

const expandScheduledStatusesSuccess = (statuses: Array<ScheduledStatus>, next: (() => Promise<PaginatedResponse<ScheduledStatus>>) | null) => ({
  type: SCHEDULED_STATUSES_EXPAND_SUCCESS,
  statuses,
  next,
});

const expandScheduledStatusesFail = (error: unknown) => ({
  type: SCHEDULED_STATUSES_EXPAND_FAIL,
  error,
});

type ScheduledStatusesAction =
  | ScheduledStatusCancelRequestAction
  | ScheduledStatusCancelSuccessAction
  | ScheduledStatusCancelFailAction
  | ReturnType<typeof fetchScheduledStatusesRequest>
  | ReturnType<typeof fetchScheduledStatusesSuccess>
  | ReturnType<typeof fetchScheduledStatusesFail>
  | ReturnType<typeof expandScheduledStatusesRequest>
  | ReturnType<typeof expandScheduledStatusesSuccess>
  | ReturnType<typeof expandScheduledStatusesFail>

export {
  SCHEDULED_STATUSES_FETCH_REQUEST,
  SCHEDULED_STATUSES_FETCH_SUCCESS,
  SCHEDULED_STATUSES_FETCH_FAIL,
  SCHEDULED_STATUSES_EXPAND_REQUEST,
  SCHEDULED_STATUSES_EXPAND_SUCCESS,
  SCHEDULED_STATUSES_EXPAND_FAIL,
  SCHEDULED_STATUS_CANCEL_REQUEST,
  SCHEDULED_STATUS_CANCEL_SUCCESS,
  SCHEDULED_STATUS_CANCEL_FAIL,
  fetchScheduledStatuses,
  cancelScheduledStatus,
  expandScheduledStatuses,
  type ScheduledStatusesAction,
};
