import { defineMessages } from 'react-intl';

import { getClient } from 'pl-fe/api';
import { normalizeAccount } from 'pl-fe/normalizers/account';
import toast from 'pl-fe/toast';

import type { Account, PaginatedResponse } from 'pl-api';
import type { RootState } from 'pl-fe/store';

const EXPORT_FOLLOWS_REQUEST = 'EXPORT_FOLLOWS_REQUEST' as const;
const EXPORT_FOLLOWS_SUCCESS = 'EXPORT_FOLLOWS_SUCCESS' as const;
const EXPORT_FOLLOWS_FAIL = 'EXPORT_FOLLOWS_FAIL' as const;

const EXPORT_BLOCKS_REQUEST = 'EXPORT_BLOCKS_REQUEST' as const;
const EXPORT_BLOCKS_SUCCESS = 'EXPORT_BLOCKS_SUCCESS' as const;
const EXPORT_BLOCKS_FAIL = 'EXPORT_BLOCKS_FAIL' as const;

const EXPORT_MUTES_REQUEST = 'EXPORT_MUTES_REQUEST' as const;
const EXPORT_MUTES_SUCCESS = 'EXPORT_MUTES_SUCCESS' as const;
const EXPORT_MUTES_FAIL = 'EXPORT_MUTES_FAIL' as const;

const messages = defineMessages({
  blocksSuccess: { id: 'export_data.success.blocks', defaultMessage: 'Blocks exported successfully' },
  followersSuccess: { id: 'export_data.success.followers', defaultMessage: 'Followers exported successfully' },
  mutesSuccess: { id: 'export_data.success.mutes', defaultMessage: 'Mutes exported successfully' },
});

type ExportDataAction = {
  type: typeof EXPORT_FOLLOWS_REQUEST
  | typeof EXPORT_BLOCKS_REQUEST
  | typeof EXPORT_MUTES_REQUEST
  | typeof EXPORT_FOLLOWS_SUCCESS
  | typeof EXPORT_BLOCKS_SUCCESS
  | typeof EXPORT_MUTES_SUCCESS;
} | {
  type: typeof EXPORT_FOLLOWS_FAIL
  | typeof EXPORT_BLOCKS_FAIL
  | typeof EXPORT_MUTES_FAIL;
  error?: unknown;
}

const fileExport = (content: string, fileName: string) => {
  const fileToDownload = document.createElement('a');

  fileToDownload.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
  fileToDownload.setAttribute('download', fileName);
  fileToDownload.style.display = 'none';
  document.body.appendChild(fileToDownload);
  fileToDownload.click();
  document.body.removeChild(fileToDownload);
};

const listAccounts = async (response: PaginatedResponse<Account>) => {
  const followings = response.items;
  let accounts = [];
  while (response.next) {
    response = await response.next();
    Array.prototype.push.apply(followings, response.items);
  }

  accounts = followings.map((account) => normalizeAccount(account).fqn);
  return Array.from(new Set(accounts));
};

const exportFollows = () => async (dispatch: React.Dispatch<ExportDataAction>, getState: () => RootState) => {
  dispatch({ type: EXPORT_FOLLOWS_REQUEST });
  const me = getState().me;
  if (!me) return;

  return getClient(getState()).accounts.getAccountFollowing(me, { limit: 40 })
    .then(listAccounts)
    .then((followings) => {
      followings = followings.map(fqn => fqn + ',true');
      followings.unshift('Account address,Show boosts');
      fileExport(followings.join('\n'), 'export_followings.csv');

      toast.success(messages.followersSuccess);
      dispatch({ type: EXPORT_FOLLOWS_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_FOLLOWS_FAIL, error });
    });
};

const exportBlocks = () => (dispatch: React.Dispatch<ExportDataAction>, getState: () => RootState) => {
  dispatch({ type: EXPORT_BLOCKS_REQUEST });
  return getClient(getState()).filtering.getBlocks({ limit: 40 })
    .then(listAccounts)
    .then((blocks) => {
      fileExport(blocks.join('\n'), 'export_block.csv');

      toast.success(messages.blocksSuccess);
      dispatch({ type: EXPORT_BLOCKS_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_BLOCKS_FAIL, error });
    });
};

const exportMutes = () => (dispatch: React.Dispatch<ExportDataAction>, getState: () => RootState) => {
  dispatch({ type: EXPORT_MUTES_REQUEST });
  return getClient(getState()).filtering.getMutes({ limit: 40 })
    .then(listAccounts)
    .then((mutes) => {
      fileExport(mutes.join('\n'), 'export_mutes.csv');

      toast.success(messages.mutesSuccess);
      dispatch({ type: EXPORT_MUTES_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_MUTES_FAIL, error });
    });
};

export {
  EXPORT_FOLLOWS_REQUEST,
  EXPORT_FOLLOWS_SUCCESS,
  EXPORT_FOLLOWS_FAIL,
  EXPORT_BLOCKS_REQUEST,
  EXPORT_BLOCKS_SUCCESS,
  EXPORT_BLOCKS_FAIL,
  EXPORT_MUTES_REQUEST,
  EXPORT_MUTES_SUCCESS,
  EXPORT_MUTES_FAIL,
  exportFollows,
  exportBlocks,
  exportMutes,
  type ExportDataAction,
};
