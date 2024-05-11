
import { fetchRelationships } from 'soapbox/actions/accounts';
import { importFetchedAccount, importFetchedAccounts, importFetchedStatuses } from 'soapbox/actions/importer';
import { accountIdsToAccts } from 'soapbox/selectors';
import { filterBadges, getTagDiff } from 'soapbox/utils/badges';
import { getFeatures } from 'soapbox/utils/features';

import api, { getLinks } from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const ADMIN_CONFIG_FETCH_REQUEST = 'ADMIN_CONFIG_FETCH_REQUEST';
const ADMIN_CONFIG_FETCH_SUCCESS = 'ADMIN_CONFIG_FETCH_SUCCESS';
const ADMIN_CONFIG_FETCH_FAIL    = 'ADMIN_CONFIG_FETCH_FAIL';

const ADMIN_CONFIG_UPDATE_REQUEST = 'ADMIN_CONFIG_UPDATE_REQUEST';
const ADMIN_CONFIG_UPDATE_SUCCESS = 'ADMIN_CONFIG_UPDATE_SUCCESS';
const ADMIN_CONFIG_UPDATE_FAIL    = 'ADMIN_CONFIG_UPDATE_FAIL';

const ADMIN_REPORTS_FETCH_REQUEST = 'ADMIN_REPORTS_FETCH_REQUEST';
const ADMIN_REPORTS_FETCH_SUCCESS = 'ADMIN_REPORTS_FETCH_SUCCESS';
const ADMIN_REPORTS_FETCH_FAIL    = 'ADMIN_REPORTS_FETCH_FAIL';

const ADMIN_REPORTS_PATCH_REQUEST = 'ADMIN_REPORTS_PATCH_REQUEST';
const ADMIN_REPORTS_PATCH_SUCCESS = 'ADMIN_REPORTS_PATCH_SUCCESS';
const ADMIN_REPORTS_PATCH_FAIL    = 'ADMIN_REPORTS_PATCH_FAIL';

const ADMIN_USERS_FETCH_REQUEST = 'ADMIN_USERS_FETCH_REQUEST';
const ADMIN_USERS_FETCH_SUCCESS = 'ADMIN_USERS_FETCH_SUCCESS';
const ADMIN_USERS_FETCH_FAIL    = 'ADMIN_USERS_FETCH_FAIL';

const ADMIN_USERS_DELETE_REQUEST = 'ADMIN_USERS_DELETE_REQUEST';
const ADMIN_USERS_DELETE_SUCCESS = 'ADMIN_USERS_DELETE_SUCCESS';
const ADMIN_USERS_DELETE_FAIL    = 'ADMIN_USERS_DELETE_FAIL';

const ADMIN_USERS_APPROVE_REQUEST = 'ADMIN_USERS_APPROVE_REQUEST';
const ADMIN_USERS_APPROVE_SUCCESS = 'ADMIN_USERS_APPROVE_SUCCESS';
const ADMIN_USERS_APPROVE_FAIL    = 'ADMIN_USERS_APPROVE_FAIL';

const ADMIN_USERS_DEACTIVATE_REQUEST = 'ADMIN_USERS_DEACTIVATE_REQUEST';
const ADMIN_USERS_DEACTIVATE_SUCCESS = 'ADMIN_USERS_DEACTIVATE_SUCCESS';
const ADMIN_USERS_DEACTIVATE_FAIL    = 'ADMIN_USERS_DEACTIVATE_FAIL';

const ADMIN_STATUS_DELETE_REQUEST = 'ADMIN_STATUS_DELETE_REQUEST';
const ADMIN_STATUS_DELETE_SUCCESS = 'ADMIN_STATUS_DELETE_SUCCESS';
const ADMIN_STATUS_DELETE_FAIL    = 'ADMIN_STATUS_DELETE_FAIL';

const ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST';
const ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS';
const ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL    = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL';

const ADMIN_USERS_TAG_REQUEST = 'ADMIN_USERS_TAG_REQUEST';
const ADMIN_USERS_TAG_SUCCESS = 'ADMIN_USERS_TAG_SUCCESS';
const ADMIN_USERS_TAG_FAIL    = 'ADMIN_USERS_TAG_FAIL';

const ADMIN_USERS_UNTAG_REQUEST = 'ADMIN_USERS_UNTAG_REQUEST';
const ADMIN_USERS_UNTAG_SUCCESS = 'ADMIN_USERS_UNTAG_SUCCESS';
const ADMIN_USERS_UNTAG_FAIL    = 'ADMIN_USERS_UNTAG_FAIL';

const ADMIN_ADD_PERMISSION_GROUP_REQUEST = 'ADMIN_ADD_PERMISSION_GROUP_REQUEST';
const ADMIN_ADD_PERMISSION_GROUP_SUCCESS = 'ADMIN_ADD_PERMISSION_GROUP_SUCCESS';
const ADMIN_ADD_PERMISSION_GROUP_FAIL    = 'ADMIN_ADD_PERMISSION_GROUP_FAIL';

const ADMIN_REMOVE_PERMISSION_GROUP_REQUEST = 'ADMIN_REMOVE_PERMISSION_GROUP_REQUEST';
const ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS = 'ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS';
const ADMIN_REMOVE_PERMISSION_GROUP_FAIL    = 'ADMIN_REMOVE_PERMISSION_GROUP_FAIL';

const ADMIN_USER_INDEX_EXPAND_FAIL    = 'ADMIN_USER_INDEX_EXPAND_FAIL';
const ADMIN_USER_INDEX_EXPAND_REQUEST = 'ADMIN_USER_INDEX_EXPAND_REQUEST';
const ADMIN_USER_INDEX_EXPAND_SUCCESS = 'ADMIN_USER_INDEX_EXPAND_SUCCESS';

const ADMIN_USER_INDEX_FETCH_FAIL    = 'ADMIN_USER_INDEX_FETCH_FAIL';
const ADMIN_USER_INDEX_FETCH_REQUEST = 'ADMIN_USER_INDEX_FETCH_REQUEST';
const ADMIN_USER_INDEX_FETCH_SUCCESS = 'ADMIN_USER_INDEX_FETCH_SUCCESS';

const ADMIN_USER_INDEX_QUERY_SET = 'ADMIN_USER_INDEX_QUERY_SET';

const fetchConfig = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_CONFIG_FETCH_REQUEST });
    return api(getState)('/api/v1/pleroma/admin/config')
      .then(({ json: data }) => {
        dispatch({ type: ADMIN_CONFIG_FETCH_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      }).catch(error => {
        dispatch({ type: ADMIN_CONFIG_FETCH_FAIL, error });
      });
  };

const updateConfig = (configs: Record<string, any>[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_CONFIG_UPDATE_REQUEST, configs });
    return api(getState)('/api/v1/pleroma/admin/config', { method: 'POST', body: JSON.stringify(configs) })
      .then(({ json: data }) => {
        dispatch({ type: ADMIN_CONFIG_UPDATE_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      }).catch(error => {
        dispatch({ type: ADMIN_CONFIG_UPDATE_FAIL, error, configs });
      });
  };

const updateSoapboxConfig = (data: Record<string, any>) =>
  (dispatch: AppDispatch, _getState: () => RootState) => {
    const params = [{
      group: ':pleroma',
      key: ':frontend_configurations',
      value: [{
        tuple: [':soapbox_fe', data],
      }],
    }];

    return dispatch(updateConfig(params));
  };

const fetchMastodonReports = (params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    api(getState)('/api/v1/admin/reports', { params })
      .then(({ json: reports }) => {
        reports.forEach((report: APIEntity) => {
          dispatch(importFetchedAccount(report.account?.account));
          dispatch(importFetchedAccount(report.target_account?.account));
          dispatch(importFetchedStatuses(report.statuses));
        });
        dispatch({ type: ADMIN_REPORTS_FETCH_SUCCESS, reports, params });
      }).catch(error => {
        dispatch({ type: ADMIN_REPORTS_FETCH_FAIL, error, params });
      });

const fetchPleromaReports = (params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    api(getState)('/api/v1/pleroma/admin/reports', { params })
      .then(({ json: { reports } }) => {
        reports.forEach((report: APIEntity) => {
          dispatch(importFetchedAccount(report.account));
          dispatch(importFetchedAccount(report.actor));
          dispatch(importFetchedStatuses(report.statuses));
        });
        dispatch({ type: ADMIN_REPORTS_FETCH_SUCCESS, reports, params });
      }).catch(error => {
        dispatch({ type: ADMIN_REPORTS_FETCH_FAIL, error, params });
      });

const fetchReports = (params: Record<string, any> = {}) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const instance = state.instance;
    const features = getFeatures(instance);

    dispatch({ type: ADMIN_REPORTS_FETCH_REQUEST, params });

    if (features.mastodonAdmin) {
      return dispatch(fetchMastodonReports(params));
    } else {
      const { resolved } = params;

      return dispatch(fetchPleromaReports({
        state: resolved === false ? 'open' : (resolved ? 'resolved' : null),
      }));
    }
  };

const patchMastodonReports = (reports: { id: string; state: string }[]) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    Promise.all(reports.map(({ id, state }) =>
      api(getState)(`/api/v1/admin/reports/${id}/${state === 'resolved' ? 'reopen' : 'resolve'}`, {
        method: 'POST',
      })
        .then(() => {
          dispatch({ type: ADMIN_REPORTS_PATCH_SUCCESS, reports });
        }).catch(error => {
          dispatch({ type: ADMIN_REPORTS_PATCH_FAIL, error, reports });
        }),
    ));

const patchPleromaReports = (reports: { id: string; state: string }[]) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    api(getState)('/api/v1/pleroma/admin/reports', {
      method: 'PATCH',
      body: JSON.stringify(reports),
    }).then(() => {
      dispatch({ type: ADMIN_REPORTS_PATCH_SUCCESS, reports });
    }).catch(error => {
      dispatch({ type: ADMIN_REPORTS_PATCH_FAIL, error, reports });
    });

const patchReports = (ids: string[], reportState: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const instance = state.instance;
    const features = getFeatures(instance);

    const reports = ids.map(id => ({ id, state: reportState }));

    dispatch({ type: ADMIN_REPORTS_PATCH_REQUEST, reports });

    if (features.mastodonAdmin) {
      return dispatch(patchMastodonReports(reports));
    } else {
      return dispatch(patchPleromaReports(reports));
    }
  };

const closeReports = (ids: string[]) =>
  patchReports(ids, 'closed');

const fetchMastodonUsers = (filters: string[], page: number, query: string | null | undefined, pageSize: number, next?: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const params: Record<string, any> = {
      username: query,
    };

    if (filters.includes('local')) params.local = true;
    if (filters.includes('active')) params.active = true;
    if (filters.includes('need_approval')) params.pending = true;

    return api(getState)(next || '/api/v1/admin/accounts', { params })
      .then((response) => {
        const accounts = response.json;
        const next = getLinks(response).refs.find(link => link.rel === 'next');

        const count = next
          ? page * pageSize + 1
          : (page - 1) * pageSize + accounts.length;

        dispatch(importFetchedAccounts(accounts.map(({ account }: APIEntity) => account)));
        dispatch(fetchRelationships(accounts.map((account: APIEntity) => account.id)));
        dispatch({ type: ADMIN_USERS_FETCH_SUCCESS, users: accounts, count, pageSize, filters, page, next: next?.uri || false });
        return { users: accounts, count, pageSize, next: next?.uri || false };
      }).catch(error =>
        dispatch({ type: ADMIN_USERS_FETCH_FAIL, error, filters, page, pageSize }),
      );
  };

const fetchPleromaUsers = (filters: string[], page: number, query?: string | null, pageSize?: number) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const params: Record<string, any> = { filters: filters.join(), page, page_size: pageSize };
    if (query) params.query = query;

    return api(getState)('/api/v1/pleroma/admin/users', { params })
      .then(({ json: { users, count, page_size: pageSize } }) => {
        dispatch(fetchRelationships(users.map((user: APIEntity) => user.id)));
        dispatch({ type: ADMIN_USERS_FETCH_SUCCESS, users, count, pageSize, filters, page });
        return { users, count, pageSize };
      }).catch(error =>
        dispatch({ type: ADMIN_USERS_FETCH_FAIL, error, filters, page, pageSize }),
      );
  };

const fetchUsers = (filters: string[] = [], page = 1, query?: string | null, pageSize = 50, next?: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const instance = state.instance;
    const features = getFeatures(instance);

    dispatch({ type: ADMIN_USERS_FETCH_REQUEST, filters, page, pageSize });

    if (features.mastodonAdmin) {
      return dispatch(fetchMastodonUsers(filters, page, query, pageSize, next));
    } else {
      return dispatch(fetchPleromaUsers(filters, page, query, pageSize));
    }
  };

const deactivateMastodonUsers = (accountIds: string[], reportId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    Promise.all(accountIds.map(accountId => {
      api(getState)(`/api/v1/admin/accounts/${accountId}/action`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'disable',
          report_id: reportId,
        }),
      })
        .then(() => {
          dispatch({ type: ADMIN_USERS_DEACTIVATE_SUCCESS, accountIds: [accountId] });
        }).catch(error => {
          dispatch({ type: ADMIN_USERS_DEACTIVATE_FAIL, error, accountIds: [accountId] });
        });
    }));

const deactivatePleromaUsers = (accountIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    return api(getState)('/api/v1/pleroma/admin/users/deactivate', {
      method: 'PATCH',
      body: JSON.stringify(nicknames),
    })
      .then(({ json: { users } }) => {
        dispatch({ type: ADMIN_USERS_DEACTIVATE_SUCCESS, users, accountIds });
      }).catch(error => {
        dispatch({ type: ADMIN_USERS_DEACTIVATE_FAIL, error, accountIds });
      });
  };

const deactivateUsers = (accountIds: string[], reportId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const instance = state.instance;
    const features = getFeatures(instance);

    dispatch({ type: ADMIN_USERS_DEACTIVATE_REQUEST, accountIds });

    if (features.mastodonAdmin) {
      return dispatch(deactivateMastodonUsers(accountIds, reportId));
    } else {
      return dispatch(deactivatePleromaUsers(accountIds));
    }
  };

const deleteUsers = (accountIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    dispatch({ type: ADMIN_USERS_DELETE_REQUEST, accountIds });
    return api(getState)('/api/v1/pleroma/admin/users', {
      method: 'DELETE', body: JSON.stringify({ nicknames }),
    }).then(({ json: nicknames }) => {
      dispatch({ type: ADMIN_USERS_DELETE_SUCCESS, nicknames, accountIds });
    }).catch(error => {
      dispatch({ type: ADMIN_USERS_DELETE_FAIL, error, accountIds });
    });
  };

const approveMastodonUsers = (accountIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    Promise.all(accountIds.map(accountId => {
      api(getState)(`/api/v1/admin/accounts/${accountId}/approve`, { method: 'POST' })
        .then(({ json: user }) => {
          dispatch({ type: ADMIN_USERS_APPROVE_SUCCESS, users: [user], accountIds: [accountId] });
        }).catch(error => {
          dispatch({ type: ADMIN_USERS_APPROVE_FAIL, error, accountIds: [accountId] });
        });
    }));

const approvePleromaUsers = (accountIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    return api(getState)('/api/v1/pleroma/admin/users/approve', {
      method: 'POST',
      body: JSON.stringify({ nicknames }),
    }).then(({ json: { users } }) => {
      dispatch({ type: ADMIN_USERS_APPROVE_SUCCESS, users, accountIds });
    }).catch(error => {
      dispatch({ type: ADMIN_USERS_APPROVE_FAIL, error, accountIds });
    });
  };

const approveUsers = (accountIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const instance = state.instance;
    const features = getFeatures(instance);

    dispatch({ type: ADMIN_USERS_APPROVE_REQUEST, accountIds });

    if (features.mastodonAdmin) {
      return dispatch(approveMastodonUsers(accountIds));
    } else {
      return dispatch(approvePleromaUsers(accountIds));
    }
  };

const deleteStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_STATUS_DELETE_REQUEST, id });
    return api(getState)(`/api/v1/pleroma/admin/statuses/${id}`, { method: 'DELETE' })
      .then(() => {
        dispatch({ type: ADMIN_STATUS_DELETE_SUCCESS, id });
      }).catch(error => {
        dispatch({ type: ADMIN_STATUS_DELETE_FAIL, error, id });
      });
  };

const toggleStatusSensitivity = (id: string, sensitive: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST, id });
    return api(getState)(`/api/v1/pleroma/admin/statuses/${id}`, {
      method: 'PUT', body: JSON.stringify({ sensitive: !sensitive }),
    }).then(() => {
      dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS, id });
    }).catch(error => {
      dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL, error, id });
    });
  };

const tagUsers = (accountIds: string[], tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    dispatch({ type: ADMIN_USERS_TAG_REQUEST, accountIds, tags });
    return api(getState)('/api/v1/pleroma/admin/users/tag', {
      method: 'PUT',
      body: JSON.stringify({ nicknames, tags }),
    }).then(() => {
      dispatch({ type: ADMIN_USERS_TAG_SUCCESS, accountIds, tags });
    }).catch(error => {
      dispatch({ type: ADMIN_USERS_TAG_FAIL, error, accountIds, tags });
    });
  };

const untagUsers = (accountIds: string[], tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);

    // Legacy: allow removing legacy 'donor' tags.
    if (tags.includes('badge:donor')) {
      tags = [...tags, 'donor'];
    }

    dispatch({ type: ADMIN_USERS_UNTAG_REQUEST, accountIds, tags });
    return api(getState)('/api/v1/pleroma/admin/users/tag', {
      method: 'DELETE',
      body: JSON.stringify({ nicknames, tags }),
    })
      .then(() => {
        dispatch({ type: ADMIN_USERS_UNTAG_SUCCESS, accountIds, tags });
      }).catch(error => {
        dispatch({ type: ADMIN_USERS_UNTAG_FAIL, error, accountIds, tags });
      });
  };

/** Synchronizes user tags to the backend. */
const setTags = (accountId: string, oldTags: string[], newTags: string[]) =>
  async(dispatch: AppDispatch) => {
    const diff = getTagDiff(oldTags, newTags);

    await dispatch(tagUsers([accountId], diff.added));
    await dispatch(untagUsers([accountId], diff.removed));
  };

/** Synchronizes badges to the backend. */
const setBadges = (accountId: string, oldTags: string[], newTags: string[]) =>
  (dispatch: AppDispatch) => {
    const oldBadges = filterBadges(oldTags);
    const newBadges = filterBadges(newTags);

    return dispatch(setTags(accountId, oldBadges, newBadges));
  };

const addPermission = (accountIds: string[], permissionGroup: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    dispatch({ type: ADMIN_ADD_PERMISSION_GROUP_REQUEST, accountIds, permissionGroup });
    return api(getState)(`/api/v1/pleroma/admin/users/permission_group/${permissionGroup}`, {
      method: 'POST',
      body: JSON.stringify({ nicknames }),
    })
      .then(({ json: data }) => {
        dispatch({ type: ADMIN_ADD_PERMISSION_GROUP_SUCCESS, accountIds, permissionGroup, data });
      }).catch(error => {
        dispatch({ type: ADMIN_ADD_PERMISSION_GROUP_FAIL, error, accountIds, permissionGroup });
      });
  };

const removePermission = (accountIds: string[], permissionGroup: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    dispatch({ type: ADMIN_REMOVE_PERMISSION_GROUP_REQUEST, accountIds, permissionGroup });
    return api(getState)(`/api/v1/pleroma/admin/users/permission_group/${permissionGroup}`, {
      method: 'DELETE',
      body: JSON.stringify({ nicknames }),
    })
      .then(({ json: data }) => {
        dispatch({ type: ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS, accountIds, permissionGroup, data });
      }).catch(error => {
        dispatch({ type: ADMIN_REMOVE_PERMISSION_GROUP_FAIL, error, accountIds, permissionGroup });
      });
  };

const promoteToAdmin = (accountId: string) =>
  (dispatch: AppDispatch) =>
    Promise.all([
      dispatch(addPermission([accountId], 'admin')),
      dispatch(removePermission([accountId], 'moderator')),
    ]);

const promoteToModerator = (accountId: string) =>
  (dispatch: AppDispatch) =>
    Promise.all([
      dispatch(removePermission([accountId], 'admin')),
      dispatch(addPermission([accountId], 'moderator')),
    ]);

const demoteToUser = (accountId: string) =>
  (dispatch: AppDispatch) =>
    Promise.all([
      dispatch(removePermission([accountId], 'admin')),
      dispatch(removePermission([accountId], 'moderator')),
    ]);

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
    const { filters, page, query, pageSize, isLoading } = getState().admin_user_index;

    if (isLoading) return;

    dispatch({ type: ADMIN_USER_INDEX_FETCH_REQUEST });

    dispatch(fetchUsers(filters.toJS() as string[], page + 1, query, pageSize))
      .then((data: any) => {
        if (data.error) {
          dispatch({ type: ADMIN_USER_INDEX_FETCH_FAIL });
        } else {
          const { users, count, next } = (data);
          dispatch({ type: ADMIN_USER_INDEX_FETCH_SUCCESS, users, count, next });
        }
      }).catch(() => {
        dispatch({ type: ADMIN_USER_INDEX_FETCH_FAIL });
      });
  };

const expandUserIndex = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { filters, page, query, pageSize, isLoading, next, loaded } = getState().admin_user_index;

    if (!loaded || isLoading) return;

    dispatch({ type: ADMIN_USER_INDEX_EXPAND_REQUEST });

    dispatch(fetchUsers(filters.toJS() as string[], page + 1, query, pageSize, next))
      .then((data: any) => {
        if (data.error) {
          dispatch({ type: ADMIN_USER_INDEX_EXPAND_FAIL });
        } else {
          const { users, count, next } = (data);
          dispatch({ type: ADMIN_USER_INDEX_EXPAND_SUCCESS, users, count, next });
        }
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
  ADMIN_REPORTS_PATCH_REQUEST,
  ADMIN_REPORTS_PATCH_SUCCESS,
  ADMIN_REPORTS_PATCH_FAIL,
  ADMIN_USERS_FETCH_REQUEST,
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USERS_FETCH_FAIL,
  ADMIN_USERS_DELETE_REQUEST,
  ADMIN_USERS_DELETE_SUCCESS,
  ADMIN_USERS_DELETE_FAIL,
  ADMIN_USERS_APPROVE_REQUEST,
  ADMIN_USERS_APPROVE_SUCCESS,
  ADMIN_USERS_APPROVE_FAIL,
  ADMIN_USERS_DEACTIVATE_REQUEST,
  ADMIN_USERS_DEACTIVATE_SUCCESS,
  ADMIN_USERS_DEACTIVATE_FAIL,
  ADMIN_STATUS_DELETE_REQUEST,
  ADMIN_STATUS_DELETE_SUCCESS,
  ADMIN_STATUS_DELETE_FAIL,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL,
  ADMIN_USERS_TAG_REQUEST,
  ADMIN_USERS_TAG_SUCCESS,
  ADMIN_USERS_TAG_FAIL,
  ADMIN_USERS_UNTAG_REQUEST,
  ADMIN_USERS_UNTAG_SUCCESS,
  ADMIN_USERS_UNTAG_FAIL,
  ADMIN_ADD_PERMISSION_GROUP_REQUEST,
  ADMIN_ADD_PERMISSION_GROUP_SUCCESS,
  ADMIN_ADD_PERMISSION_GROUP_FAIL,
  ADMIN_REMOVE_PERMISSION_GROUP_REQUEST,
  ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS,
  ADMIN_REMOVE_PERMISSION_GROUP_FAIL,
  ADMIN_USER_INDEX_EXPAND_FAIL,
  ADMIN_USER_INDEX_EXPAND_REQUEST,
  ADMIN_USER_INDEX_EXPAND_SUCCESS,
  ADMIN_USER_INDEX_FETCH_FAIL,
  ADMIN_USER_INDEX_FETCH_REQUEST,
  ADMIN_USER_INDEX_FETCH_SUCCESS,
  ADMIN_USER_INDEX_QUERY_SET,
  fetchConfig,
  updateConfig,
  updateSoapboxConfig,
  fetchReports,
  closeReports,
  fetchUsers,
  deactivateUsers,
  deleteUsers,
  approveUsers,
  deleteStatus,
  toggleStatusSensitivity,
  tagUsers,
  untagUsers,
  setTags,
  setBadges,
  addPermission,
  removePermission,
  promoteToAdmin,
  promoteToModerator,
  demoteToUser,
  setRole,
  setUserIndexQuery,
  fetchUserIndex,
  expandUserIndex,
};
