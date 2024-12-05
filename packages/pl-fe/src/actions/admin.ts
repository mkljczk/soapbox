import { fetchRelationships } from 'pl-fe/actions/accounts';
import { importEntities } from 'pl-fe/actions/importer';
import { filterBadges, getTagDiff } from 'pl-fe/utils/badges';

import { getClient } from '../api';

import { deleteFromTimelines } from './timelines';

import type { Account, AdminAccount, AdminGetAccountsParams, AdminGetReportsParams, AdminReport, PaginatedResponse, PleromaConfig, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const ADMIN_CONFIG_FETCH_SUCCESS = 'ADMIN_CONFIG_FETCH_SUCCESS' as const;

const ADMIN_CONFIG_UPDATE_REQUEST = 'ADMIN_CONFIG_UPDATE_REQUEST' as const;
const ADMIN_CONFIG_UPDATE_SUCCESS = 'ADMIN_CONFIG_UPDATE_SUCCESS' as const;

const ADMIN_REPORTS_FETCH_SUCCESS = 'ADMIN_REPORTS_FETCH_SUCCESS' as const;

const ADMIN_REPORT_PATCH_SUCCESS = 'ADMIN_REPORT_PATCH_SUCCESS' as const;

const ADMIN_USERS_FETCH_SUCCESS = 'ADMIN_USERS_FETCH_SUCCESS' as const;

const ADMIN_USER_DELETE_SUCCESS = 'ADMIN_USER_DELETE_SUCCESS' as const;

const ADMIN_USER_APPROVE_REQUEST = 'ADMIN_USER_APPROVE_REQUEST' as const;
const ADMIN_USER_APPROVE_SUCCESS = 'ADMIN_USER_APPROVE_SUCCESS' as const;

const ADMIN_USER_INDEX_EXPAND_FAIL = 'ADMIN_USER_INDEX_EXPAND_FAIL' as const;
const ADMIN_USER_INDEX_EXPAND_REQUEST = 'ADMIN_USER_INDEX_EXPAND_REQUEST' as const;
const ADMIN_USER_INDEX_EXPAND_SUCCESS = 'ADMIN_USER_INDEX_EXPAND_SUCCESS' as const;

const ADMIN_USER_INDEX_FETCH_FAIL = 'ADMIN_USER_INDEX_FETCH_FAIL' as const;
const ADMIN_USER_INDEX_FETCH_REQUEST = 'ADMIN_USER_INDEX_FETCH_REQUEST' as const;
const ADMIN_USER_INDEX_FETCH_SUCCESS = 'ADMIN_USER_INDEX_FETCH_SUCCESS' as const;

const ADMIN_USER_INDEX_QUERY_SET = 'ADMIN_USER_INDEX_QUERY_SET' as const;

const fetchConfig = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.config.getPleromaConfig()
      .then((data) => {
        dispatch<AdminActions>({ type: ADMIN_CONFIG_FETCH_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      });

const updateConfig = (configs: PleromaConfig['configs']) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<AdminActions>({ type: ADMIN_CONFIG_UPDATE_REQUEST, configs });
    return getClient(getState).admin.config.updatePleromaConfig(configs)
      .then((data) => {
        dispatch<AdminActions>({ type: ADMIN_CONFIG_UPDATE_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      });
  };

const updatePlFeConfig = (data: Record<string, any>) =>
  (dispatch: AppDispatch) => {
    const params = [{
      group: ':pleroma',
      key: ':frontend_configurations',
      value: [{
        tuple: [':pl_fe', data],
      }],
    }];

    return dispatch(updateConfig(params));
  };

const fetchReports = (params?: AdminGetReportsParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.reports.getReports(params)
      .then(({ items }) => {
        items.forEach((report) => {
          dispatch(importEntities({ statuses: report.statuses as Array<Status>, accounts: [report.account?.account, report.target_account?.account] }));
          dispatch<AdminActions>({ type: ADMIN_REPORTS_FETCH_SUCCESS, reports: items, params });
        });
      });

const closeReport = (reportId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.reports.resolveReport(reportId);

const fetchUsers = (params?: AdminGetAccountsParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    return getClient(state).admin.accounts.getAccounts(params).then((res) => {
      dispatch(importEntities({ accounts: res.items.map(({ account }) => account).filter((account): account is Account => account !== null) }));
      dispatch(fetchRelationships(res.items.map((account) => account.id)));
      dispatch<AdminActions>({ type: ADMIN_USERS_FETCH_SUCCESS, users: res.items, params, next: res.next });
      return res;
    });
  };

const deactivateUser = (accountId: string, report_id?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    return getClient(state).admin.accounts.performAccountAction(accountId, 'suspend', { report_id });
  };

const deleteUser = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.deleteAccount(accountId);

const approveUser = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch<AdminActions>({ type: ADMIN_USER_APPROVE_REQUEST, accountId });

    return getClient(state).admin.accounts.approveAccount(accountId);
  };

const deleteStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    return getClient(getState).admin.statuses.deleteStatus(statusId)
      .then(() => {
        dispatch(deleteFromTimelines(statusId));
        return ({ statusId });
      });
  };

const toggleStatusSensitivity = (statusId: string, sensitive: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    return getClient(getState).admin.statuses.updateStatus(statusId, { sensitive: !sensitive })
      .then((status) => {
        dispatch(importEntities({ statuses: [status] }));
      });
  };

const tagUser = (accountId: string, tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.tagUser(accountId, tags);

const untagUser = (accountId: string, tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.untagUser(accountId, tags);

/** Synchronizes user tags to the backend. */
const setTags = (accountId: string, oldTags: string[], newTags: string[]) =>
  async(dispatch: AppDispatch) => {
    const diff = getTagDiff(oldTags, newTags);

    if (diff.added.length) await dispatch(tagUser(accountId, diff.added));
    if (diff.removed.length) await dispatch(untagUser(accountId, diff.removed));
  };

/** Synchronizes badges to the backend. */
const setBadges = (accountId: string, oldTags: string[], newTags: string[]) =>
  (dispatch: AppDispatch) => {
    const oldBadges = filterBadges(oldTags);
    const newBadges = filterBadges(newTags);

    return dispatch(setTags(accountId, oldBadges, newBadges));
  };

const promoteToAdmin = (accountId: string) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.promoteToAdmin(accountId);

const promoteToModerator = (accountId: string) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.promoteToModerator(accountId);

const demoteToUser = (accountId: string) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.demoteToUser(accountId);

const setRole = (accountId: string, role: 'user' | 'moderator' | 'admin') =>
  (dispatch: AppDispatch) => {
    switch (role) {
      case 'user':
        return dispatch(demoteToUser(accountId));
      case 'moderator':
        return dispatch(promoteToModerator(accountId));
      case 'admin':
        return dispatch(promoteToAdmin(accountId));
    }
  };

const setUserIndexQuery = (query: string) => ({ type: ADMIN_USER_INDEX_QUERY_SET, query });

const fetchUserIndex = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { query, isLoading } = getState().admin_user_index;

    if (isLoading) return;

    dispatch<AdminActions>({ type: ADMIN_USER_INDEX_FETCH_REQUEST });

    const params: AdminGetAccountsParams = {
      origin: 'local',
      status: 'active',
      username: query,
    };

    dispatch(fetchUsers(params))
      .then((data) => {
        const { items, total, next } = data;
        dispatch<AdminActions>({ type: ADMIN_USER_INDEX_FETCH_SUCCESS, users: items, total, next, params });
      }).catch(() => {
        dispatch<AdminActions>({ type: ADMIN_USER_INDEX_FETCH_FAIL });
      });
  };

const expandUserIndex = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { params, next, isLoading, loaded } = getState().admin_user_index;

    if (!loaded || isLoading || !next) return;

    dispatch<AdminActions>({ type: ADMIN_USER_INDEX_EXPAND_REQUEST });

    next()
      .then((data) => {
        const { items, total, next } = data;
        dispatch<AdminActions>({ type: ADMIN_USER_INDEX_EXPAND_SUCCESS, users: items, total, next, params });
      }).catch(() => {
        dispatch<AdminActions>({ type: ADMIN_USER_INDEX_EXPAND_FAIL });
      });
  };

type AdminActions =
  | { type: typeof ADMIN_CONFIG_FETCH_SUCCESS; configs: PleromaConfig['configs']; needsReboot: boolean }
  | { type: typeof ADMIN_CONFIG_UPDATE_REQUEST; configs: PleromaConfig['configs'] }
  | { type: typeof ADMIN_CONFIG_UPDATE_SUCCESS; configs: PleromaConfig['configs']; needsReboot: boolean }
  | { type: typeof ADMIN_REPORTS_FETCH_SUCCESS; reports: Array<AdminReport>; params?: AdminGetReportsParams }
  | { type: typeof ADMIN_REPORT_PATCH_SUCCESS; report: AdminReport; reportId: string }
  | { type: typeof ADMIN_USERS_FETCH_SUCCESS; users: Array<AdminAccount>; params?: AdminGetAccountsParams; next: (() => Promise<PaginatedResponse<AdminAccount>>) | null }
  | { type: typeof ADMIN_USER_DELETE_SUCCESS; accountId: string }
  | { type: typeof ADMIN_USER_APPROVE_REQUEST; accountId: string }
  | { type: typeof ADMIN_USER_APPROVE_SUCCESS; user: AdminAccount; accountId: string }
  | ReturnType<typeof setUserIndexQuery>
  | { type: typeof ADMIN_USER_INDEX_FETCH_REQUEST }
  | { type: typeof ADMIN_USER_INDEX_FETCH_SUCCESS; users: Array<AdminAccount>; total?: number; next: (() => Promise<PaginatedResponse<AdminAccount>>) | null; params?: AdminGetAccountsParams }
  | { type: typeof ADMIN_USER_INDEX_FETCH_FAIL }
  | { type: typeof ADMIN_USER_INDEX_EXPAND_REQUEST }
  | { type: typeof ADMIN_USER_INDEX_EXPAND_SUCCESS; users: Array<AdminAccount>; total?: number; next: (() => Promise<PaginatedResponse<AdminAccount>>) | null; params: AdminGetAccountsParams | null }
  | { type: typeof ADMIN_USER_INDEX_EXPAND_FAIL };

export {
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_UPDATE_REQUEST,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  ADMIN_REPORTS_FETCH_SUCCESS,
  ADMIN_REPORT_PATCH_SUCCESS,
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USER_DELETE_SUCCESS,
  ADMIN_USER_APPROVE_REQUEST,
  ADMIN_USER_APPROVE_SUCCESS,
  ADMIN_USER_INDEX_EXPAND_FAIL,
  ADMIN_USER_INDEX_EXPAND_REQUEST,
  ADMIN_USER_INDEX_EXPAND_SUCCESS,
  ADMIN_USER_INDEX_FETCH_FAIL,
  ADMIN_USER_INDEX_FETCH_REQUEST,
  ADMIN_USER_INDEX_FETCH_SUCCESS,
  ADMIN_USER_INDEX_QUERY_SET,
  fetchConfig,
  updateConfig,
  updatePlFeConfig,
  fetchReports,
  closeReport,
  fetchUsers,
  deactivateUser,
  deleteUser,
  approveUser,
  deleteStatus,
  toggleStatusSensitivity,
  setBadges,
  setRole,
  setUserIndexQuery,
  fetchUserIndex,
  expandUserIndex,
  type AdminActions,
};
