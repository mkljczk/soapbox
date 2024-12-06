import { useModalsStore } from 'pl-fe/stores/modals';

import { getClient } from '../api';

import type { Account } from 'pl-fe/normalizers/account';
import type { Status } from 'pl-fe/normalizers/status';
import type { AppDispatch, RootState } from 'pl-fe/store';

enum ReportableEntities {
  ACCOUNT = 'ACCOUNT',
  STATUS = 'STATUS'
}

type ReportedEntity = {
  status?: Pick<Status, 'id' | 'reblog_id'>;
}

const initReport = (entityType: ReportableEntities, account: Pick<Account, 'id'>, entities?: ReportedEntity) => (dispatch: AppDispatch) => {
  const { status } = entities || {};

  return useModalsStore.getState().openModal('REPORT', {
    accountId: account.id,
    entityType,
    statusIds: status ? [status.id] : [],
  });
};

const submitReport = (accountId: string, statusIds: string[], ruleIds?: string[], comment?: string, forward?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => getClient(getState()).accounts.reportAccount(accountId, {
    status_ids: statusIds,
    rule_ids: ruleIds,
    comment: comment,
    forward: forward,
  });

export {
  ReportableEntities,
  initReport,
  submitReport,
};
