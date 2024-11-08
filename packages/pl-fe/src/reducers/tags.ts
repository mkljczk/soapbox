import { create } from 'mutative';

import {
  HASHTAG_FETCH_SUCCESS,
  HASHTAG_FOLLOW_REQUEST,
  HASHTAG_FOLLOW_FAIL,
  HASHTAG_UNFOLLOW_REQUEST,
  HASHTAG_UNFOLLOW_FAIL,
  type TagsAction,
} from 'pl-fe/actions/tags';

import type { Tag } from 'pl-api';

type State = Record<string, Tag>;

const initialState: State = {};

const tags = (state = initialState, action: TagsAction) => {
  switch (action.type) {
    case HASHTAG_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft[action.name] = action.tag;
      });
    case HASHTAG_FOLLOW_REQUEST:
    case HASHTAG_UNFOLLOW_FAIL:
      return create(state, (draft) => {
        if (draft[action.name]) draft[action.name].following = true;
      });
    case HASHTAG_FOLLOW_FAIL:
    case HASHTAG_UNFOLLOW_REQUEST:
      return create(state, (draft) => {
        if (draft[action.name]) draft[action.name].following = false;
      });
    default:
      return state;
  }
};

export { tags as default };
