import { create } from 'mutative';
import { CreateStatusParams } from 'pl-api';

import {
  STATUS_CREATE_FAIL,
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
} from 'pl-fe/actions/statuses';

import type { StatusVisibility } from 'pl-fe/normalizers/status';
import type { AnyAction } from 'redux';

interface PendingStatus {
  content_type: string;
  in_reply_to_id: string | null;
  media_ids: Array<string> | null;
  quote_id: string | null;
  poll: Exclude<CreateStatusParams['poll'], undefined> | null;
  sensitive: boolean;
  spoiler_text: string;
  status: string;
  to: Array<string> | null;
  visibility: StatusVisibility;
}

const newPendingStatus = (props: Partial<PendingStatus> = {}): PendingStatus => ({
  content_type: '',
  in_reply_to_id: null,
  media_ids: null,
  quote_id: null,
  poll: null,
  sensitive: false,
  spoiler_text: '',
  status: '',
  to: null,
  visibility: 'public',
  ...props,
});

type State = Record<string, PendingStatus>;

const initialState: State = {};

const importStatus = (state: State, params: Record<string, any>, idempotencyKey: string) => {
  state[idempotencyKey] = newPendingStatus(params);
};

const deleteStatus = (state: State, idempotencyKey: string) => {
  delete state[idempotencyKey];
};

const pending_statuses = (state = initialState, action: AnyAction): State => {
  switch (action.type) {
    case STATUS_CREATE_REQUEST:
      if (action.editing) return state;
      return create(state, (draft) => importStatus(draft, action.params, action.idempotencyKey));
    case STATUS_CREATE_FAIL:
    case STATUS_CREATE_SUCCESS:
      return create(state, (draft) => deleteStatus(draft, action.idempotencyKey));
    default:
      return state;
  }
};

export {
  type PendingStatus,
  pending_statuses as default,
};
