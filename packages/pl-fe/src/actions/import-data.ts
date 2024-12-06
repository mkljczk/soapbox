import { defineMessages } from 'react-intl';

import toast from 'pl-fe/toast';

import { getClient } from '../api';

import type { AppDispatch, RootState } from 'pl-fe/store';

const messages = defineMessages({
  blocksSuccess: { id: 'import_data.success.blocks', defaultMessage: 'Blocks imported successfully' },
  followersSuccess: { id: 'import_data.success.followers', defaultMessage: 'Followers imported successfully' },
  mutesSuccess: { id: 'import_data.success.mutes', defaultMessage: 'Mutes imported successfully' },
});

const importFollows = (list: File | string, overwrite?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.importFollows(list, overwrite ? 'overwrite' : 'merge').then(response => {
      toast.success(messages.followersSuccess);
    });

const importBlocks = (list: File | string, overwrite?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.importBlocks(list, overwrite ? 'overwrite' : 'merge').then(response => {
      toast.success(messages.blocksSuccess);
    });

const importMutes = (list: File | string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.importMutes(list).then(response => {
      toast.success(messages.mutesSuccess);
    });

export {
  importFollows,
  importBlocks,
  importMutes,
};
