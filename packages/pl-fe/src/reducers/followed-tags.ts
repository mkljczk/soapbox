import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

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

const ReducerRecord = ImmutableRecord({
  items: ImmutableList<Tag>(),
  isLoading: false,
  next: null as (() => Promise<PaginatedResponse<Tag>>) | null,
});

const followed_tags = (state = ReducerRecord(), action: TagsAction) => {
  switch (action.type) {
    case FOLLOWED_HASHTAGS_FETCH_REQUEST:
      return state.set('isLoading', true);
    case FOLLOWED_HASHTAGS_FETCH_SUCCESS:
      return state.withMutations(map => {
        map.set('items', ImmutableList(action.followed_tags));
        map.set('isLoading', false);
        map.set('next', action.next);
      });
    case FOLLOWED_HASHTAGS_FETCH_FAIL:
      return state.set('isLoading', false);
    case FOLLOWED_HASHTAGS_EXPAND_REQUEST:
      return state.set('isLoading', true);
    case FOLLOWED_HASHTAGS_EXPAND_SUCCESS:
      return state.withMutations(map => {
        map.update('items', list => list.concat(action.followed_tags));
        map.set('isLoading', false);
        map.set('next', action.next);
      });
    case FOLLOWED_HASHTAGS_EXPAND_FAIL:
      return state.set('isLoading', false);
    default:
      return state;
  }
};

export { followed_tags as default };
