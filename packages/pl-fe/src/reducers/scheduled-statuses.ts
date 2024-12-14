import { create } from 'mutative';

import { STATUS_IMPORT, STATUSES_IMPORT, type ImporterAction } from 'pl-fe/actions/importer';
import { STATUS_CREATE_SUCCESS, type StatusesAction } from 'pl-fe/actions/statuses';

import type { Status, ScheduledStatus } from 'pl-api';

type State = Record<string, ScheduledStatus>;

const initialState: State = {};

const importStatus = (state: State, status: Status | ScheduledStatus) => {
  if (!status.scheduled_at) return state;
  state[status.id] = status;
};

const importStatuses = (state: State, statuses: Array<Status | ScheduledStatus>) => {
  statuses.forEach(status => importStatus(state, status));
};

const scheduled_statuses = (state: State = initialState, action: ImporterAction | StatusesAction) => {
  switch (action.type) {
    case STATUS_IMPORT:
    case STATUS_CREATE_SUCCESS:
      return create(state, (draft) => importStatus(draft, action.status));
    case STATUSES_IMPORT:
      return create(state, (draft) => importStatuses(draft, action.statuses));
    default:
      return state;
  }
};

export { scheduled_statuses as default };
