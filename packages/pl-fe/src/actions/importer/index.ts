import { importEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';
import { normalizeAccount, type Account } from 'pl-fe/normalizers/account';
import { normalizeGroup, type Group } from 'pl-fe/normalizers/group';

import type { Account as BaseAccount, Group as BaseGroup, Poll, Status as BaseStatus } from 'pl-api';
import type { AppDispatch } from 'pl-fe/store';

const STATUS_IMPORT = 'STATUS_IMPORT';
const STATUSES_IMPORT = 'STATUSES_IMPORT';
const POLLS_IMPORT = 'POLLS_IMPORT';

const importAccounts = (data: Array<BaseAccount>) => {
  let accounts: Array<Account> = [];

  try {
    accounts = data.map(normalizeAccount);
  } catch (e) {
    //
  }

  return importEntities(accounts, Entities.ACCOUNTS);
};

const importGroup = (data: BaseGroup) => importGroups([data]);

const importGroups = (data: Array<BaseGroup>) => {
  let groups: Array<Group> = [];
  try {
    groups = data.map(normalizeGroup);
  } catch (e) {
    //
  }

  return importEntities(groups, Entities.GROUPS);
};

const importStatus = (status: BaseStatus & { expectsCard?: boolean }, idempotencyKey?: string) => ({ type: STATUS_IMPORT, status, idempotencyKey });

const importStatuses = (statuses: Array<BaseStatus>) => ({ type: STATUSES_IMPORT, statuses });

const importPolls = (polls: Array<Poll>) => ({ type: POLLS_IMPORT, polls });

const importFetchedAccount = (account: BaseAccount) =>
  importFetchedAccounts([account]);

const importFetchedAccounts = (accounts: Array<BaseAccount>) => {
  const normalAccounts: Array<BaseAccount> = [];

  const processAccount = (account: BaseAccount) => {
    if (!account.id) return;

    normalAccounts.push(account);

    if (account.moved) {
      processAccount(account.moved);
    }
  };

  accounts.forEach(processAccount);

  return importAccounts(normalAccounts);
};

const importFetchedStatus = (status: BaseStatus & { expectsCard?: boolean }, idempotencyKey?: string) =>
  (dispatch: AppDispatch) => {
    // Skip broken statuses
    if (isBroken(status)) return;

    if (status.reblog?.id) {
      dispatch(importFetchedStatus(status.reblog as BaseStatus));
    }

    // Fedibird quotes
    if (status.quote?.id) {
      dispatch(importFetchedStatus(status.quote as BaseStatus));
    }

    // Fedibird quote from reblog
    if (status.reblog?.quote?.id) {
      dispatch(importFetchedStatus(status.reblog.quote));
    }

    if (status.poll?.id) {
      dispatch(importFetchedPoll(status.poll));
    }

    if (status.group?.id) {
      dispatch(importGroup(status.group));
    }

    dispatch(importFetchedAccount(status.account));
    dispatch(importStatus(status, idempotencyKey));
  };

// Sometimes Pleroma can return an empty account,
// or a repost can appear of a deleted account. Skip these statuses.
const isBroken = (status: BaseStatus) => {
  try {
    if (status.scheduled_at !== null) return true;
    // Skip empty accounts
    // https://gitlab.com/soapbox-pub/soapbox/-/issues/424
    if (!status.account.id) return true;
    // Skip broken reposts
    // https://gitlab.com/soapbox-pub/rebased/-/issues/28
    if (status.reblog && !status.reblog.account.id) return true;
    return false;
  } catch (e) {
    return true;
  }
};

const importFetchedPoll = (poll: Poll) =>
  (dispatch: AppDispatch) => {
    dispatch(importPolls([poll]));
  };

export {
  STATUS_IMPORT,
  STATUSES_IMPORT,
  POLLS_IMPORT,
  importAccounts,
  importGroups,
  importStatus,
  importStatuses,
  importPolls,
  importFetchedStatus,
};
