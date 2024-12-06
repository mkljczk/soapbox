import { create } from 'mutative';

import {
  DOMAIN_BLOCKS_FETCH_SUCCESS,
  DOMAIN_BLOCKS_EXPAND_SUCCESS,
  DOMAIN_UNBLOCK_SUCCESS,
  type DomainBlocksAction,
} from '../actions/domain-blocks';

import type { PaginatedResponse } from 'pl-api';

interface State {
  blocks: {
    items: Array<string>;
    next: (() => Promise<PaginatedResponse<string>>) | null;
  };
}

const initialState: State = {
  blocks: {
    items: [],
    next: null,
  },
};

const domainLists = (state: State = initialState, action: DomainBlocksAction): State => {
  switch (action.type) {
    case DOMAIN_BLOCKS_FETCH_SUCCESS:
      return create(state, (draft) => {
        draft.blocks.items = action.domains;
        draft.blocks.next = action.next;
      });
    case DOMAIN_BLOCKS_EXPAND_SUCCESS:
      return create(state, (draft) => {
        draft.blocks.items = [...new Set([...draft.blocks.items, ...action.domains])];
        draft.blocks.next = action.next;
      });
    case DOMAIN_UNBLOCK_SUCCESS:
      return create(state, (draft) => {
        draft.blocks.items = draft.blocks.items.filter(item => item !== action.domain);
      });
    default:
      return state;
  }
};

export { domainLists as default };
