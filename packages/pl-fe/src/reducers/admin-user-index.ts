import { create } from 'mutative';

import {
  ADMIN_USER_INDEX_EXPAND_FAIL,
  ADMIN_USER_INDEX_EXPAND_REQUEST,
  ADMIN_USER_INDEX_EXPAND_SUCCESS,
  ADMIN_USER_INDEX_FETCH_FAIL,
  ADMIN_USER_INDEX_FETCH_REQUEST,
  ADMIN_USER_INDEX_FETCH_SUCCESS,
  ADMIN_USER_INDEX_QUERY_SET,
  type AdminActions,
} from 'pl-fe/actions/admin';

import type { AdminAccount, AdminGetAccountsParams, PaginatedResponse } from 'pl-api';
import type { APIEntity } from 'pl-fe/types/entities';

type State = {
  isLoading: boolean;
  loaded: boolean;
  items: Array<string>;
  total?: number;
  page: number;
  query: string;
  next: (() => Promise<PaginatedResponse<AdminAccount>>) | null;
  params: AdminGetAccountsParams | null;
}

const initialState: State = {
  isLoading: false,
  loaded: false,
  items: [],
  total: Infinity,
  page: -1,
  query: '',
  next: null,
  params: null,
};

const admin_user_index = (state: State = initialState, action: AdminActions): State => {
  switch (action.type) {
    case ADMIN_USER_INDEX_QUERY_SET:
      return create(state, draft => {
        draft.query = action.query;
      });
    case ADMIN_USER_INDEX_FETCH_REQUEST:
      return create(state, draft => {
        draft.isLoading = true;
        draft.loaded = true;
        draft.items = [];
        draft.total = Infinity;
        draft.page = 0;
        draft.next = null;
      });
    case ADMIN_USER_INDEX_FETCH_SUCCESS:
      return create(state, draft => {
        draft.isLoading = false;
        draft.loaded = true;
        draft.items = action.users.map((user: APIEntity) => user.id);
        draft.total = action.total;
        draft.page = 1;
        draft.next = action.next;
      });
    case ADMIN_USER_INDEX_FETCH_FAIL:
    case ADMIN_USER_INDEX_EXPAND_FAIL:
      return create(state, draft => {
        draft.isLoading = false;
      });
    case ADMIN_USER_INDEX_EXPAND_REQUEST:
      return create(state, draft => {
        draft.isLoading = true;
      });
    case ADMIN_USER_INDEX_EXPAND_SUCCESS:
      return create(state, draft => {
        draft.isLoading = false;
        draft.loaded = true;
        draft.items = [...new Set(draft.items.concat(action.users.map((user: APIEntity) => user.id)))];
        draft.total = action.total;
        draft.page = 1;
        draft.next = action.next;
      });
    default:
      return state;
  }
};

export { admin_user_index as default };
