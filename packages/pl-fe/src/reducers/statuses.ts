import omit from 'lodash/omit';
import { create } from 'mutative';

import { normalizeStatus, Status as StatusRecord } from 'pl-fe/normalizers/status';
import { queryClient } from 'pl-fe/queries/client';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';

import {
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_FAIL,
  type EventsAction,
} from '../actions/events';
import { STATUS_IMPORT, STATUSES_IMPORT, type ImporterAction } from '../actions/importer';
import {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_FAIL,
  STATUS_DELETE_REQUEST,
  STATUS_DELETE_FAIL,
  STATUS_MUTE_SUCCESS,
  STATUS_UNMUTE_SUCCESS,
  type StatusesAction,
  STATUS_DELETE_SUCCESS,
} from '../actions/statuses';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { Status as BaseStatus, CreateStatusParams } from 'pl-api';

type State = Record<string, MinifiedStatus>;

type MinifiedStatus = ReturnType<typeof minifyStatus>;

const minifyStatus = (status: StatusRecord) => omit(status, ['reblog', 'poll', 'quote', 'group']);

const fixStatus = (state: State, status: BaseStatus): MinifiedStatus => {
  const oldStatus = state[status.id];
  const normalizedStatus = normalizeStatus(status, oldStatus);
  queryClient.setQueryData(statusQueryOptions(status.id).queryKey, normalizedStatus);
  return minifyStatus(normalizedStatus);
};

const importStatus = (state: State, status: BaseStatus) =>{
  state[status.id] = fixStatus(state, status);
};

const importStatuses = (state: State, statuses: Array<BaseStatus>) =>{
  statuses.forEach(status => importStatus(state, status));
};

const deleteStatus = (state: State, statusId: string, references: Array<[string, string]>) => {
  references.forEach(ref => {
    deleteStatus(state, ref[0], []);
  });

  delete state[statusId];
};

const incrementReplyCount = (state: State, { in_reply_to_id, quote_id }: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>) => {
  if (in_reply_to_id && state[in_reply_to_id]) {
    const parent = state[in_reply_to_id];
    parent.replies_count = (typeof parent.replies_count === 'number' ? parent.replies_count : 0) + 1;
  }

  if (quote_id && state[quote_id]) {
    const parent = state[quote_id];
    parent.quotes_count = (typeof parent.quotes_count === 'number' ? parent.quotes_count : 0) + 1;
  }

  return state;
};

const decrementReplyCount = (state: State, { in_reply_to_id, quote_id }: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>) => {
  if (in_reply_to_id && state[in_reply_to_id]) {
    const parent = state[in_reply_to_id];
    parent.replies_count = Math.max(0, parent.replies_count - 1);
  }

  if (quote_id) {
    const parent = state[quote_id];
    parent.quotes_count = Math.max(0, parent.quotes_count - 1);
  }

  return state;
};

const initialState: State = {};

const statuses = (state = initialState, action: EventsAction | ImporterAction | StatusesAction | TimelineAction): State => {
  switch (action.type) {
    case STATUS_IMPORT:
      return create(state, (draft) => importStatus(draft, action.status));
    case STATUSES_IMPORT:
      return create(state, (draft) => importStatuses(draft, action.statuses));
    case STATUS_CREATE_REQUEST:
      return action.editing ? state : create(state, (draft) => incrementReplyCount(draft, action.params));
    case STATUS_CREATE_FAIL:
      return action.editing ? state : create(state, (draft) => decrementReplyCount(draft, action.params));
    case STATUS_MUTE_SUCCESS:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.muted = true;
        }
      });
    case STATUS_UNMUTE_SUCCESS:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.muted = false;
        }
      });
    case STATUS_DELETE_REQUEST:
      return create(state, (draft) => decrementReplyCount(draft, action.params));
    case STATUS_DELETE_FAIL:
      return create(state, (draft) => incrementReplyCount(draft, action.params));
    case TIMELINE_DELETE:
      return create(state, (draft) => deleteStatus(draft, action.statusId, action.references));
    case EVENT_JOIN_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = 'pending';
        }
      });
    case EVENT_JOIN_FAIL:
    case EVENT_LEAVE_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = null;
        }
      });
    case EVENT_LEAVE_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = action.previousState;
        }
      });
    case STATUS_DELETE_SUCCESS:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.deleted = true;
        }
      });
    default:
      return state;
  }
};

export {
  type MinifiedStatus,
  statuses as default,
};
