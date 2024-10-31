import { Map as ImmutableMap } from 'immutable';

import { STATUS_IMPORT, STATUSES_IMPORT, type ImporterAction } from 'pl-fe/actions/importer';
import {
  SCHEDULED_STATUSES_FETCH_SUCCESS,
  SCHEDULED_STATUS_CANCEL_REQUEST,
  SCHEDULED_STATUS_CANCEL_SUCCESS,
} from 'pl-fe/actions/scheduled-statuses';
import { STATUS_CREATE_SUCCESS } from 'pl-fe/actions/statuses';

import type { Status, ScheduledStatus } from 'pl-api';
import type { AnyAction } from 'redux';

type State = ImmutableMap<string, ScheduledStatus>;

const initialState: State = ImmutableMap();

const importStatus = (state: State, status: Status | ScheduledStatus) => {
  if (!status.scheduled_at) return state;
  return state.set(status.id, status);
};

const importStatuses = (state: State, statuses: Array<Status | ScheduledStatus>) =>
  state.withMutations(mutable => statuses.forEach(status => importStatus(mutable, status)));

const deleteStatus = (state: State, statusId: string) => state.delete(statusId);

const scheduled_statuses = (state: State = initialState, action: AnyAction | ImporterAction) => {
  switch (action.type) {
    case STATUS_IMPORT:
    case STATUS_CREATE_SUCCESS:
      return importStatus(state, action.status);
    case STATUSES_IMPORT:
    case SCHEDULED_STATUSES_FETCH_SUCCESS:
      return importStatuses(state, action.statuses);
    case SCHEDULED_STATUS_CANCEL_REQUEST:
    case SCHEDULED_STATUS_CANCEL_SUCCESS:
      return deleteStatus(state, action.statusId);
    default:
      return state;
  }
};

export { scheduled_statuses as default };
