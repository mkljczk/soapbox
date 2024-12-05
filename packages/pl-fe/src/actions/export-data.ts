import { defineMessages } from 'react-intl';

import { getClient } from 'pl-fe/api';
import { normalizeAccount } from 'pl-fe/normalizers/account';
import toast from 'pl-fe/toast';

import type { Account, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const messages = defineMessages({
  blocksSuccess: { id: 'export_data.success.blocks', defaultMessage: 'Blocks exported successfully' },
  followersSuccess: { id: 'export_data.success.followers', defaultMessage: 'Followers exported successfully' },
  mutesSuccess: { id: 'export_data.success.mutes', defaultMessage: 'Mutes exported successfully' },
});

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

const exportFollows = () => async (_dispatch: AppDispatch, getState: () => RootState) => {
  const me = getState().me;
  if (!me) return;

  return getClient(getState()).accounts.getAccountFollowing(me, { limit: 40 })
    .then(listAccounts)
    .then((followings) => {
      followings = followings.map(fqn => fqn + ',true');
      followings.unshift('Account address,Show boosts');
      fileExport(followings.join('\n'), 'export_followings.csv');

      toast.success(messages.followersSuccess);
    });
};

const exportBlocks = () => (_dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState()).filtering.getBlocks({ limit: 40 })
    .then(listAccounts)
    .then((blocks) => {
      fileExport(blocks.join('\n'), 'export_block.csv');

      toast.success(messages.blocksSuccess);
    });

const exportMutes = () => (_dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState()).filtering.getMutes({ limit: 40 })
    .then(listAccounts)
    .then((mutes) => {
      fileExport(mutes.join('\n'), 'export_mutes.csv');

      toast.success(messages.mutesSuccess);
    });

export {
  exportFollows,
  exportBlocks,
  exportMutes,
};
