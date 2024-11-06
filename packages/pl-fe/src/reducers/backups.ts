import { create } from 'mutative';

import { BACKUPS_FETCH_SUCCESS, BACKUPS_CREATE_SUCCESS, type BackupsAction } from '../actions/backups';

import type { Backup } from 'pl-api';

type State = Record<string, Backup>;

const initialState: State = {};

const backups = (state = initialState, action: BackupsAction) => {
  switch (action.type) {
    case BACKUPS_FETCH_SUCCESS:
    case BACKUPS_CREATE_SUCCESS:
      return create(state, (draft) => action.backups.forEach((backup) => draft[backup.inserted_at] = backup));
    default:
      return state;
  }
};

export {
  backups as default,
};
