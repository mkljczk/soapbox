import { getClient } from '../api';

import type { Backup } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const BACKUPS_FETCH_REQUEST = 'BACKUPS_FETCH_REQUEST' as const;
const BACKUPS_FETCH_SUCCESS = 'BACKUPS_FETCH_SUCCESS' as const;
const BACKUPS_FETCH_FAIL = 'BACKUPS_FETCH_FAIL' as const;

const BACKUPS_CREATE_REQUEST = 'BACKUPS_CREATE_REQUEST' as const;
const BACKUPS_CREATE_SUCCESS = 'BACKUPS_CREATE_SUCCESS' as const;
const BACKUPS_CREATE_FAIL = 'BACKUPS_CREATE_FAIL' as const;

interface BackupsFetchRequestAction {
  type: typeof BACKUPS_FETCH_REQUEST;
}

interface BackupsFetchSuccessAction {
  type: typeof BACKUPS_FETCH_SUCCESS;
  backups: Array<Backup>;
}

interface BackupsFetchFailAction {
  type: typeof BACKUPS_FETCH_FAIL;
  error: unknown;
}

const fetchBackups = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<BackupsFetchRequestAction>({ type: BACKUPS_FETCH_REQUEST });

    return getClient(getState).settings.getBackups().then((backups) =>
      dispatch<BackupsFetchSuccessAction>({ type: BACKUPS_FETCH_SUCCESS, backups }),
    ).catch(error => {
      dispatch<BackupsFetchFailAction>({ type: BACKUPS_FETCH_FAIL, error });
    });
  };

  interface BackupsCreateRequestAction {
    type: typeof BACKUPS_CREATE_REQUEST;
  }

  interface BackupsCreateSuccessAction {
    type: typeof BACKUPS_CREATE_SUCCESS;
    backups: Array<Backup>;
  }

  interface BackupsCreateFailAction {
    type: typeof BACKUPS_CREATE_FAIL;
    error: unknown;
  }

const createBackup = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<BackupsCreateRequestAction>({ type: BACKUPS_CREATE_REQUEST });
    return getClient(getState).settings.createBackup().then((backup) =>
      dispatch<BackupsCreateSuccessAction>({ type: BACKUPS_CREATE_SUCCESS, backups: [backup] }),
    ).catch(error => {
      dispatch<BackupsCreateFailAction>({ type: BACKUPS_CREATE_FAIL, error });
    });
  };

type BackupsAction =
  | BackupsFetchRequestAction
  | BackupsFetchSuccessAction
  | BackupsFetchFailAction
  | BackupsCreateRequestAction
  | BackupsCreateSuccessAction
  | BackupsCreateFailAction;

export {
  BACKUPS_FETCH_REQUEST,
  BACKUPS_FETCH_SUCCESS,
  BACKUPS_FETCH_FAIL,
  BACKUPS_CREATE_REQUEST,
  BACKUPS_CREATE_SUCCESS,
  BACKUPS_CREATE_FAIL,
  fetchBackups,
  createBackup,
  type BackupsAction,
};
