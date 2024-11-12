import { importEntities } from 'pl-hooks';

import { fetchRelationships } from 'pl-fe/actions/accounts';
import { getClient } from 'pl-fe/api';
import { filterBadges, getTagDiff } from 'pl-fe/utils/badges';

import { deleteFromTimelines } from './timelines';

import type { Account, AdminGetAccountsParams, AdminGetReportsParams, PleromaConfig, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const ADMIN_CONFIG_FETCH_REQUEST = 'ADMIN_CONFIG_FETCH_REQUEST' as const;
const ADMIN_CONFIG_FETCH_SUCCESS = 'ADMIN_CONFIG_FETCH_SUCCESS' as const;
const ADMIN_CONFIG_FETCH_FAIL = 'ADMIN_CONFIG_FETCH_FAIL' as const;

const ADMIN_CONFIG_UPDATE_REQUEST = 'ADMIN_CONFIG_UPDATE_REQUEST' as const;
const ADMIN_CONFIG_UPDATE_SUCCESS = 'ADMIN_CONFIG_UPDATE_SUCCESS' as const;
const ADMIN_CONFIG_UPDATE_FAIL = 'ADMIN_CONFIG_UPDATE_FAIL' as const;

const ADMIN_REPORTS_FETCH_REQUEST = 'ADMIN_REPORTS_FETCH_REQUEST' as const;
const ADMIN_REPORTS_FETCH_SUCCESS = 'ADMIN_REPORTS_FETCH_SUCCESS' as const;
const ADMIN_REPORTS_FETCH_FAIL = 'ADMIN_REPORTS_FETCH_FAIL' as const;

const ADMIN_REPORT_PATCH_REQUEST = 'ADMIN_REPORT_PATCH_REQUEST' as const;
const ADMIN_REPORT_PATCH_SUCCESS = 'ADMIN_REPORT_PATCH_SUCCESS' as const;
const ADMIN_REPORT_PATCH_FAIL = 'ADMIN_REPORT_PATCH_FAIL' as const;

const ADMIN_USERS_FETCH_REQUEST = 'ADMIN_USERS_FETCH_REQUEST' as const;
const ADMIN_USERS_FETCH_SUCCESS = 'ADMIN_USERS_FETCH_SUCCESS' as const;
const ADMIN_USERS_FETCH_FAIL = 'ADMIN_USERS_FETCH_FAIL' as const;

const ADMIN_USER_DELETE_REQUEST = 'ADMIN_USER_DELETE_REQUEST' as const;
const ADMIN_USER_DELETE_SUCCESS = 'ADMIN_USER_DELETE_SUCCESS' as const;
const ADMIN_USER_DELETE_FAIL = 'ADMIN_USER_DELETE_FAIL' as const;

const ADMIN_USER_APPROVE_REQUEST = 'ADMIN_USER_APPROVE_REQUEST' as const;
const ADMIN_USER_APPROVE_SUCCESS = 'ADMIN_USER_APPROVE_SUCCESS' as const;
const ADMIN_USER_APPROVE_FAIL = 'ADMIN_USER_APPROVE_FAIL' as const;

const ADMIN_USER_DEACTIVATE_REQUEST = 'ADMIN_USER_DEACTIVATE_REQUEST' as const;
const ADMIN_USER_DEACTIVATE_SUCCESS = 'ADMIN_USER_DEACTIVATE_SUCCESS' as const;
const ADMIN_USER_DEACTIVATE_FAIL = 'ADMIN_USER_DEACTIVATE_FAIL' as const;

const ADMIN_STATUS_DELETE_REQUEST = 'ADMIN_STATUS_DELETE_REQUEST' as const;
const ADMIN_STATUS_DELETE_SUCCESS = 'ADMIN_STATUS_DELETE_SUCCESS' as const;
const ADMIN_STATUS_DELETE_FAIL = 'ADMIN_STATUS_DELETE_FAIL' as const;

const ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST' as const;
const ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS' as const;
const ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL' as const;

const ADMIN_USER_TAG_REQUEST = 'ADMIN_USERS_TAG_REQUEST' as const;
const ADMIN_USER_TAG_SUCCESS = 'ADMIN_USERS_TAG_SUCCESS' as const;
const ADMIN_USER_TAG_FAIL = 'ADMIN_USERS_TAG_FAIL' as const;

const ADMIN_USER_UNTAG_REQUEST = 'ADMIN_USERS_UNTAG_REQUEST' as const;
const ADMIN_USER_UNTAG_SUCCESS = 'ADMIN_USERS_UNTAG_SUCCESS' as const;
const ADMIN_USER_UNTAG_FAIL = 'ADMIN_USERS_UNTAG_FAIL' as const;

const ADMIN_USER_INDEX_EXPAND_FAIL = 'ADMIN_USER_INDEX_EXPAND_FAIL' as const;
const ADMIN_USER_INDEX_EXPAND_REQUEST = 'ADMIN_USER_INDEX_EXPAND_REQUEST' as const;
const ADMIN_USER_INDEX_EXPAND_SUCCESS = 'ADMIN_USER_INDEX_EXPAND_SUCCESS' as const;

const ADMIN_USER_INDEX_FETCH_FAIL = 'ADMIN_USER_INDEX_FETCH_FAIL' as const;
const ADMIN_USER_INDEX_FETCH_REQUEST = 'ADMIN_USER_INDEX_FETCH_REQUEST' as const;
const ADMIN_USER_INDEX_FETCH_SUCCESS = 'ADMIN_USER_INDEX_FETCH_SUCCESS' as const;

const ADMIN_USER_INDEX_QUERY_SET = 'ADMIN_USER_INDEX_QUERY_SET' as const;

const fetchConfig = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_CONFIG_FETCH_REQUEST });
    return getClient(getState).admin.config.getPleromaConfig()
      .then((data) => {
        dispatch({ type: ADMIN_CONFIG_FETCH_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      }).catch(error => {
        dispatch({ type: ADMIN_CONFIG_FETCH_FAIL, error });
      });
  };

const updateConfig = (configs: PleromaConfig['configs']) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_CONFIG_UPDATE_REQUEST, configs });
    return getClient(getState).admin.config.updatePleromaConfig(configs)
      .then((data) => {
        dispatch({ type: ADMIN_CONFIG_UPDATE_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      }).catch(error => {
        dispatch({ type: ADMIN_CONFIG_UPDATE_FAIL, error, configs });
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
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_REPORTS_FETCH_REQUEST, params });

    return getClient(state).admin.reports.getReports(params)
      .then(({ items }) => {
        const accounts: Array<Account> = [];
        const statuses: Array<Status> = [];

        items.forEach((report) => {
          importEntities({ statuses: report.statuses as Array<Status>, accounts: [report.account?.account, report.target_account?.account] });
          dispatch({ type: ADMIN_REPORTS_FETCH_SUCCESS, reports: items, params });
        });

        importEntities({ accounts, statuses });
      }).catch(error => {
        dispatch({ type: ADMIN_REPORTS_FETCH_FAIL, error, params });
      });
  };

const closeReport = (reportId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_REPORT_PATCH_REQUEST, reportId });

    return getClient(state).admin.reports.resolveReport(reportId).then((report) => {
      dispatch({ type: ADMIN_REPORT_PATCH_SUCCESS, report, reportId });
    }).catch(error => {
      dispatch({ type: ADMIN_REPORT_PATCH_FAIL, error, reportId });
    });
  };

const fetchUsers = (params?: AdminGetAccountsParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_USERS_FETCH_REQUEST, params });

    return getClient(state).admin.accounts.getAccounts(params).then((res) => {
      importEntities({ accounts: res.items.map(({ account }) => account).filter((account): account is Account => account !== null) });
      dispatch(fetchRelationships(res.items.map((account) => account.id)));
      dispatch({ type: ADMIN_USERS_FETCH_SUCCESS, users: res.items, params, next: res.next });
      return res;
    }).catch(error => {
      dispatch({ type: ADMIN_USERS_FETCH_FAIL, error, params });
      throw error;
    });
  };

const deactivateUser = (accountId: string, report_id?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_USER_DEACTIVATE_REQUEST, accountId });

    return getClient(state).admin.accounts.performAccountAction(accountId, 'suspend', { report_id });
  };

const deleteUser = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_USER_DELETE_REQUEST, accountId });

    return getClient(getState).admin.accounts.deleteAccount(accountId)
      .then(() => {
        dispatch({ type: ADMIN_USER_DELETE_SUCCESS, accountId });
      }).catch(error => {
        dispatch({ type: ADMIN_USER_DELETE_FAIL, error, accountId });
      });
  };

const approveUser = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_USER_APPROVE_REQUEST, accountId });

    return getClient(state).admin.accounts.approveAccount(accountId)
      .then((user) => {
        dispatch({ type: ADMIN_USER_APPROVE_SUCCESS, user, accountId });
      }).catch(error => {
        dispatch({ type: ADMIN_USER_APPROVE_FAIL, error, accountId });
      });
  };

const deleteStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_STATUS_DELETE_REQUEST, statusId });
    return getClient(getState).admin.statuses.deleteStatus(statusId)
      .then(() => {
        dispatch(deleteFromTimelines(statusId));
        return dispatch({ type: ADMIN_STATUS_DELETE_SUCCESS, statusId });
      }).catch(error => {
        return dispatch({ type: ADMIN_STATUS_DELETE_FAIL, error, statusId });
      });
  };

const toggleStatusSensitivity = (statusId: string, sensitive: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST, statusId });
    return getClient(getState).admin.statuses.updateStatus(statusId, { sensitive: !sensitive })
      .then((status) => {
        importEntities({ statuses: [status] });
        dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS, statusId, status });
      }).catch(error => {
        dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL, error, statusId });
      });
  };

const tagUser = (accountId: string, tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_USER_TAG_REQUEST, accountId, tags });
    return getClient(getState).admin.accounts.tagUser(accountId, tags).then(() => {
      dispatch({ type: ADMIN_USER_TAG_SUCCESS, accountId, tags });
    }).catch(error => {
      dispatch({ type: ADMIN_USER_TAG_FAIL, error, accountId, tags });
    });
  };

const untagUser = (accountId: string, tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_USER_UNTAG_REQUEST, accountId, tags });
    return getClient(getState).admin.accounts.untagUser(accountId, tags).then(() => {
      dispatch({ type: ADMIN_USER_UNTAG_SUCCESS, accountId, tags });
    }).catch(error => {
      dispatch({ type: ADMIN_USER_UNTAG_FAIL, error, accountId, tags });
    });
  };

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

    dispatch({ type: ADMIN_USER_INDEX_FETCH_REQUEST });

    const params: AdminGetAccountsParams = {
      origin: 'local',
      status: 'active',
      username: query,
    };

    dispatch(fetchUsers(params))
      .then((data) => {
        const { items, total, next } = data;
        dispatch({ type: ADMIN_USER_INDEX_FETCH_SUCCESS, users: items, total, next, params });
      }).catch(() => {
        dispatch({ type: ADMIN_USER_INDEX_FETCH_FAIL });
      });
  };

const expandUserIndex = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { params, next, isLoading, loaded } = getState().admin_user_index;

    if (!loaded || isLoading || !next) return;

    dispatch({ type: ADMIN_USER_INDEX_EXPAND_REQUEST });

    next()
      .then((data) => {
        const { items, total, next } = data;
        dispatch({ type: ADMIN_USER_INDEX_EXPAND_SUCCESS, users: items, total, next, params });
      }).catch(() => {
        dispatch({ type: ADMIN_USER_INDEX_EXPAND_FAIL });
      });
  };

export {
  ADMIN_CONFIG_FETCH_REQUEST,
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_FETCH_FAIL,
  ADMIN_CONFIG_UPDATE_REQUEST,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  ADMIN_CONFIG_UPDATE_FAIL,
  ADMIN_REPORTS_FETCH_REQUEST,
  ADMIN_REPORTS_FETCH_SUCCESS,
  ADMIN_REPORTS_FETCH_FAIL,
  ADMIN_REPORT_PATCH_REQUEST,
  ADMIN_REPORT_PATCH_SUCCESS,
  ADMIN_REPORT_PATCH_FAIL,
  ADMIN_USERS_FETCH_REQUEST,
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USERS_FETCH_FAIL,
  ADMIN_USER_DELETE_REQUEST,
  ADMIN_USER_DELETE_SUCCESS,
  ADMIN_USER_DELETE_FAIL,
  ADMIN_USER_APPROVE_REQUEST,
  ADMIN_USER_APPROVE_SUCCESS,
  ADMIN_USER_APPROVE_FAIL,
  ADMIN_USER_DEACTIVATE_REQUEST,
  ADMIN_USER_DEACTIVATE_SUCCESS,
  ADMIN_USER_DEACTIVATE_FAIL,
  ADMIN_STATUS_DELETE_REQUEST,
  ADMIN_STATUS_DELETE_SUCCESS,
  ADMIN_STATUS_DELETE_FAIL,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL,
  ADMIN_USER_TAG_REQUEST,
  ADMIN_USER_TAG_SUCCESS,
  ADMIN_USER_TAG_FAIL,
  ADMIN_USER_UNTAG_REQUEST,
  ADMIN_USER_UNTAG_SUCCESS,
  ADMIN_USER_UNTAG_FAIL,
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
  tagUser,
  untagUser,
  setTags,
  setBadges,
  promoteToAdmin,
  promoteToModerator,
  demoteToUser,
  setRole,
  setUserIndexQuery,
  fetchUserIndex,
  expandUserIndex,
};
