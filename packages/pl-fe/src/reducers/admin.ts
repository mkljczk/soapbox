import omit from 'lodash/omit';
import { create } from 'mutative';

import {
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  ADMIN_REPORTS_FETCH_SUCCESS,
  ADMIN_REPORT_PATCH_SUCCESS,
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USER_DELETE_SUCCESS,
  ADMIN_USER_APPROVE_REQUEST,
  ADMIN_USER_APPROVE_SUCCESS,
  type AdminActions,
} from 'pl-fe/actions/admin';
import { normalizeAdminReport, type AdminReport as MinifiedReport } from 'pl-fe/normalizers/admin-report';

import type { AdminAccount, AdminGetAccountsParams, AdminReport } from 'pl-api';
import type { Config } from 'pl-fe/utils/config-db';

interface State {
  reports: Record<string, MinifiedReport>;
  openReports: Array<string>;
  users: Record<string, MinifiedUser>;
  latestUsers: Array<string>;
  awaitingApproval: Array<string>;
  configs: Array<Config>;
  needsReboot: boolean;
}

const initialState: State = {
  reports: {},
  openReports: [],
  users: {},
  latestUsers: [],
  awaitingApproval: [],
  configs: [],
  needsReboot: false,
};

const toIds = (items: any[]) => items.map(item => item.id);

const maybeImportUnapproved = (state: State, users: Array<AdminAccount>, params?: AdminGetAccountsParams) => {
  if (params?.origin === 'local' && params.status === 'pending') {
    const newIds = toIds(users);
    state.awaitingApproval = [...new Set([...state.awaitingApproval, ...newIds])];
  } else {
    return state;
  }
};

const maybeImportLatest = (state: State, users: Array<AdminAccount>, params?: AdminGetAccountsParams) => {
  if (params?.origin === 'local' && params.status === 'active') {
    const newIds = toIds(users);
    state.latestUsers = newIds;
  }
};

const minifyUser = (user: AdminAccount) => omit(user, ['account']);

type MinifiedUser = ReturnType<typeof minifyUser>;

const importUsers = (state: State, users: Array<AdminAccount>, params?: AdminGetAccountsParams) => {
  maybeImportUnapproved(state, users, params);
  maybeImportLatest(state, users, params);

  users.forEach(user => {
    const normalizedUser = minifyUser(user);
    state.users[user.id] = normalizedUser;
  });
};

const deleteUser = (state: State, accountId: string) => {
  state.awaitingApproval = state.awaitingApproval.filter(id => id !== accountId);
  delete state.users[accountId];
};

const approveUser = (state: State, user: AdminAccount) => {
  const normalizedUser = minifyUser(user);
  state.awaitingApproval = state.awaitingApproval.filter(id => id !== user.id);
  state.users[user.id] = normalizedUser;
};

const importReports = (state: State, reports: Array<AdminReport>) => {
  reports.forEach(report => {
    const minifiedReport = normalizeAdminReport(report);
    if (!minifiedReport.action_taken) {
      state.openReports = [...new Set([...state.openReports, report.id])];
    }
    state.reports[report.id] = minifiedReport;
  });
};

const handleReportDiffs = (state: State, report: AdminReport) => {
  // Note: the reports here aren't full report objects
  // hence the need for a new function.
  switch (report.action_taken) {
    case false:
      state.openReports = [...new Set([...state.openReports, report.id])];
      break;
    default:
      state.openReports = state.openReports.filter(id => id !== report.id);
  }
};

const importConfigs = (state: State, configs: any) => {
  state.configs = configs;
};

const admin = (state = initialState, action: AdminActions): State => {
  switch (action.type) {
    case ADMIN_CONFIG_FETCH_SUCCESS:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return create(state, (draft) => importConfigs(draft, action.configs));
    case ADMIN_REPORTS_FETCH_SUCCESS:
      return create(state, (draft) => importReports(draft, action.reports));
    case ADMIN_REPORT_PATCH_SUCCESS:
      return create(state, (draft) => handleReportDiffs(draft, action.report));
    case ADMIN_USERS_FETCH_SUCCESS:
      return create(state, (draft) => importUsers(draft, action.users, action.params));
    case ADMIN_USER_DELETE_SUCCESS:
      return create(state, (draft) => deleteUser(draft, action.accountId));
    case ADMIN_USER_APPROVE_REQUEST:
      return create(state, (draft) => {
        draft.awaitingApproval = draft.awaitingApproval.filter(value => value !== action.accountId);
      });
    case ADMIN_USER_APPROVE_SUCCESS:
      return create(state, (draft) => approveUser(draft, action.user));
    default:
      return state;
  }
};

export { admin as default };
