import { create } from 'mutative';

import {
  FOLLOWED_HASHTAGS_FETCH_REQUEST,
  FOLLOWED_HASHTAGS_FETCH_SUCCESS,
  FOLLOWED_HASHTAGS_FETCH_FAIL,
  FOLLOWED_HASHTAGS_EXPAND_REQUEST,
  FOLLOWED_HASHTAGS_EXPAND_SUCCESS,
  FOLLOWED_HASHTAGS_EXPAND_FAIL,
  TagsAction,
} from 'pl-fe/actions/tags';

import type { PaginatedResponse, Tag } from 'pl-api';

interface State {
  items: Array<Tag>;
  isLoading: boolean;
  next: (() => Promise<PaginatedResponse<Tag>>) | null;
}

const initalState: State = {
  items: [],
  isLoading: false,
  next: null,
};

const followed_tags = (state = initalState, action: TagsAction): State => {
  switch (action.type) {
    case FOLLOWED_HASHTAGS_FETCH_REQUEST:
    case FOLLOWED_HASHTAGS_EXPAND_REQUEST:
      return create(state, draft => {
        draft.isLoading = true;
      });
    case FOLLOWED_HASHTAGS_FETCH_SUCCESS:
      return create(state, draft => {
        draft.items = action.followed_tags;
        draft.isLoading = true;
        draft.next = action.next;
      });
    case FOLLOWED_HASHTAGS_FETCH_FAIL:
    case FOLLOWED_HASHTAGS_EXPAND_FAIL:
      return create(state, draft => {
        draft.isLoading = false;
      });
    case FOLLOWED_HASHTAGS_EXPAND_SUCCESS:
      return create(state, draft => {
        draft.items = [...draft.items, ...action.followed_tags];
        draft.isLoading = true;
        draft.next = action.next;
      });
    default:
      return state;
  }
};

export { followed_tags as default };
