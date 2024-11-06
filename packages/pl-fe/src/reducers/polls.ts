import { create } from 'mutative';

import { POLLS_IMPORT, type ImporterAction } from 'pl-fe/actions/importer';

import type { Poll } from 'pl-api';

type State = Record<string, Poll>;

const initialState: State = {};

const polls = (state: State = initialState, action: ImporterAction): State => {
  switch (action.type) {
    case POLLS_IMPORT:
      return create(state, (draft) => action.polls.forEach(poll => draft[poll.id] = poll));
    default:
      return state;
  }
};

export { polls as default };
