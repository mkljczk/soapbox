import { useModalsStore } from 'pl-fe/stores/modals';

import { getClient } from '../api';

import type { Account } from 'pl-fe/normalizers/account';
import type { Status } from 'pl-fe/normalizers/status';
import type { AppDispatch, RootState } from 'pl-fe/store';

const REPORT_SUBMIT_REQUEST = 'REPORT_SUBMIT_REQUEST' as const;
const REPORT_SUBMIT_SUCCESS = 'REPORT_SUBMIT_SUCCESS' as const;
const REPORT_SUBMIT_FAIL = 'REPORT_SUBMIT_FAIL' as const;

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
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(submitReportRequest());

    return getClient(getState()).accounts.reportAccount(accountId, {
      status_ids: statusIds,
      rule_ids: ruleIds,
      comment: comment,
      forward: forward,
    });
  };

const submitReportRequest = () => ({
  type: REPORT_SUBMIT_REQUEST,
});

const submitReportSuccess = () => ({
  type: REPORT_SUBMIT_SUCCESS,
});

const submitReportFail = (error: unknown) => ({
  type: REPORT_SUBMIT_FAIL,
  error,
});

export {
  ReportableEntities,
  REPORT_SUBMIT_REQUEST,
  REPORT_SUBMIT_SUCCESS,
  REPORT_SUBMIT_FAIL,
  initReport,
  submitReport,
  submitReportRequest,
  submitReportSuccess,
  submitReportFail,
};
