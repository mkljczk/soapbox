import { defineMessages } from 'react-intl';

import toast from 'pl-fe/toast';

import { getClient } from '../api';

import type { RootState } from 'pl-fe/store';

const IMPORT_FOLLOWS_REQUEST = 'IMPORT_FOLLOWS_REQUEST' as const;
const IMPORT_FOLLOWS_SUCCESS = 'IMPORT_FOLLOWS_SUCCESS' as const;
const IMPORT_FOLLOWS_FAIL = 'IMPORT_FOLLOWS_FAIL' as const;

const IMPORT_BLOCKS_REQUEST = 'IMPORT_BLOCKS_REQUEST' as const;
const IMPORT_BLOCKS_SUCCESS = 'IMPORT_BLOCKS_SUCCESS' as const;
const IMPORT_BLOCKS_FAIL = 'IMPORT_BLOCKS_FAIL' as const;

const IMPORT_MUTES_REQUEST = 'IMPORT_MUTES_REQUEST' as const;
const IMPORT_MUTES_SUCCESS = 'IMPORT_MUTES_SUCCESS' as const;
const IMPORT_MUTES_FAIL = 'IMPORT_MUTES_FAIL' as const;

type ImportDataActions = {
  type: typeof IMPORT_FOLLOWS_REQUEST
  | typeof IMPORT_BLOCKS_REQUEST
  | typeof IMPORT_MUTES_REQUEST;
} | {
  type: typeof IMPORT_FOLLOWS_SUCCESS
  | typeof IMPORT_BLOCKS_SUCCESS
  | typeof IMPORT_MUTES_SUCCESS;
  response?: string;
} | {
  type: | typeof IMPORT_FOLLOWS_FAIL
  | typeof IMPORT_BLOCKS_FAIL
  | typeof IMPORT_MUTES_FAIL;
  error?: unknown;
}

const messages = defineMessages({
  blocksSuccess: { id: 'import_data.success.blocks', defaultMessage: 'Blocks imported successfully' },
  followersSuccess: { id: 'import_data.success.followers', defaultMessage: 'Followers imported successfully' },
  mutesSuccess: { id: 'import_data.success.mutes', defaultMessage: 'Mutes imported successfully' },
});

const importFollows = (list: File | string, overwrite?: boolean) =>
  (dispatch: React.Dispatch<ImportDataActions>, getState: () => RootState) => {
    dispatch({ type: IMPORT_FOLLOWS_REQUEST });
    return getClient(getState).settings.importFollows(list, overwrite ? 'overwrite' : 'merge').then(response => {
      toast.success(messages.followersSuccess);
      dispatch({ type: IMPORT_FOLLOWS_SUCCESS, response });
    }).catch(error => {
      dispatch({ type: IMPORT_FOLLOWS_FAIL, error });
    });
  };

const importBlocks = (list: File | string, overwrite?: boolean) =>
  (dispatch: React.Dispatch<ImportDataActions>, getState: () => RootState) => {
    dispatch({ type: IMPORT_BLOCKS_REQUEST });
    return getClient(getState).settings.importBlocks(list, overwrite ? 'overwrite' : 'merge').then(response => {
      toast.success(messages.blocksSuccess);
      dispatch({ type: IMPORT_BLOCKS_SUCCESS, response });
    }).catch(error => {
      dispatch({ type: IMPORT_BLOCKS_FAIL, error });
    });
  };

const importMutes = (list: File | string) =>
  (dispatch: React.Dispatch<ImportDataActions>, getState: () => RootState) => {
    dispatch({ type: IMPORT_MUTES_REQUEST });
    return getClient(getState).settings.importMutes(list).then(response => {
      toast.success(messages.mutesSuccess);
      dispatch({ type: IMPORT_MUTES_SUCCESS, response });
    }).catch(error => {
      dispatch({ type: IMPORT_MUTES_FAIL, error });
    });
  };

export {
  IMPORT_FOLLOWS_REQUEST,
  IMPORT_FOLLOWS_SUCCESS,
  IMPORT_FOLLOWS_FAIL,
  IMPORT_BLOCKS_REQUEST,
  IMPORT_BLOCKS_SUCCESS,
  IMPORT_BLOCKS_FAIL,
  IMPORT_MUTES_REQUEST,
  IMPORT_MUTES_SUCCESS,
  IMPORT_MUTES_FAIL,
  importFollows,
  importBlocks,
  importMutes,
};
