import {
  PLEROMA,
  type UpdateNotificationSettingsParams,
  type Account,
  type CreateAccountParams,
  type PlApiClient,
  type Relationship,
  type Token,
} from 'pl-api';

import { Entities } from 'pl-fe/entity-store/entities';
import { queryClient } from 'pl-fe/queries/client';
import { selectAccount } from 'pl-fe/selectors';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient, type PlfeResponse } from '../api';

import { importEntities } from './importer';

import type { MinifiedSuggestion } from 'pl-fe/api/hooks/trends/use-suggested-accounts';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';
import type { AppDispatch, RootState } from 'pl-fe/store';
import type { History } from 'pl-fe/types/history';

const ACCOUNT_CREATE_REQUEST = 'ACCOUNT_CREATE_REQUEST' as const;
const ACCOUNT_CREATE_SUCCESS = 'ACCOUNT_CREATE_SUCCESS' as const;
const ACCOUNT_CREATE_FAIL = 'ACCOUNT_CREATE_FAIL' as const;

const ACCOUNT_FETCH_REQUEST = 'ACCOUNT_FETCH_REQUEST' as const;
const ACCOUNT_FETCH_SUCCESS = 'ACCOUNT_FETCH_SUCCESS' as const;
const ACCOUNT_FETCH_FAIL = 'ACCOUNT_FETCH_FAIL' as const;

const ACCOUNT_BLOCK_REQUEST = 'ACCOUNT_BLOCK_REQUEST' as const;
const ACCOUNT_BLOCK_SUCCESS = 'ACCOUNT_BLOCK_SUCCESS' as const;
const ACCOUNT_BLOCK_FAIL = 'ACCOUNT_BLOCK_FAIL' as const;

const ACCOUNT_MUTE_REQUEST = 'ACCOUNT_MUTE_REQUEST' as const;
const ACCOUNT_MUTE_SUCCESS = 'ACCOUNT_MUTE_SUCCESS' as const;
const ACCOUNT_MUTE_FAIL = 'ACCOUNT_MUTE_FAIL' as const;

const ACCOUNT_SEARCH_REQUEST = 'ACCOUNT_SEARCH_REQUEST' as const;
const ACCOUNT_SEARCH_SUCCESS = 'ACCOUNT_SEARCH_SUCCESS' as const;
const ACCOUNT_SEARCH_FAIL = 'ACCOUNT_SEARCH_FAIL' as const;

const ACCOUNT_LOOKUP_REQUEST = 'ACCOUNT_LOOKUP_REQUEST' as const;
const ACCOUNT_LOOKUP_SUCCESS = 'ACCOUNT_LOOKUP_SUCCESS' as const;
const ACCOUNT_LOOKUP_FAIL = 'ACCOUNT_LOOKUP_FAIL' as const;

const NOTIFICATION_SETTINGS_REQUEST = 'NOTIFICATION_SETTINGS_REQUEST' as const;
const NOTIFICATION_SETTINGS_SUCCESS = 'NOTIFICATION_SETTINGS_SUCCESS' as const;
const NOTIFICATION_SETTINGS_FAIL = 'NOTIFICATION_SETTINGS_FAIL' as const;

const maybeRedirectLogin = (error: { response: PlfeResponse }, history?: History) => {
  // The client is unauthorized - redirect to login.
  if (history && error?.response?.status === 401) {
    history.push('/login');
  }
};

const noOp = () => new Promise(f => f(undefined));

interface AccountCreateRequestAction {
  type: typeof ACCOUNT_CREATE_REQUEST;
  params: CreateAccountParams;
}

interface AccountCreateSuccessAction {
  type: typeof ACCOUNT_CREATE_SUCCESS;
  params: CreateAccountParams;
  token: Token;
}

interface AccountCreateFailAction {
  type: typeof ACCOUNT_CREATE_FAIL;
  params: CreateAccountParams;
  error: unknown;
}

const createAccount = (params: CreateAccountParams) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<AccountCreateRequestAction>({ type: ACCOUNT_CREATE_REQUEST, params });
    return getClient(getState()).settings.createAccount(params).then((token) =>
      dispatch<AccountCreateSuccessAction>({ type: ACCOUNT_CREATE_SUCCESS, params, token }),
    ).catch(error => {
      dispatch<AccountCreateFailAction>({ type: ACCOUNT_CREATE_FAIL, error, params });
      throw error;
    });
  };

const fetchAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchRelationships([accountId]));

    const account = selectAccount(getState(), accountId);

    if (account) {
      return Promise.resolve(null);
    }

    dispatch(fetchAccountRequest(accountId));

    return getClient(getState()).accounts.getAccount(accountId)
      .then(response => {
        dispatch(importEntities({ accounts: [response] }));
        dispatch(fetchAccountSuccess(response));
      })
      .catch(error => {
        dispatch(fetchAccountFail(accountId, error));
      });
  };

const fetchAccountByUsername = (username: string, history?: History) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { auth, me } = getState();
    const features = auth.client.features;

    if (features.accountByUsername && (me || !features.accountLookup)) {
      return getClient(getState()).accounts.getAccount(username).then(response => {
        dispatch(fetchRelationships([response.id]));
        dispatch(importEntities({ accounts: [response] }));
        dispatch(fetchAccountSuccess(response));
      }).catch(error => {
        dispatch(fetchAccountFail(null, error));
      });
    } else if (features.accountLookup) {
      return dispatch(accountLookup(username)).then(account => {
        dispatch(fetchRelationships([account.id]));
        dispatch(fetchAccountSuccess(account));
      }).catch(error => {
        dispatch(fetchAccountFail(null, error));
        maybeRedirectLogin(error, history);
      });
    } else {
      return getClient(getState()).accounts.searchAccounts(username, { resolve: true, limit: 1 }).then(accounts => {
        const found = accounts.find((a) => a.acct === username);

        if (found) {
          dispatch(fetchRelationships([found.id]));
          dispatch(fetchAccountSuccess(found));
        } else {
          throw accounts;
        }
      }).catch(error => {
        dispatch(fetchAccountFail(null, error));
      });
    }
  };

const fetchAccountRequest = (accountId: string) => ({
  type: ACCOUNT_FETCH_REQUEST,
  accountId,
});

const fetchAccountSuccess = (account: Account) => ({
  type: ACCOUNT_FETCH_SUCCESS,
  account,
});

const fetchAccountFail = (accountId: string | null, error: unknown) => ({
  type: ACCOUNT_FETCH_FAIL,
  accountId,
  error,
  skipAlert: true,
});

const blockAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(blockAccountRequest(accountId));

    return getClient(getState).filtering.blockAccount(accountId)
      .then(response => {
        dispatch(importEntities({ relationships: [response] }));

        queryClient.setQueryData<Array<MinifiedSuggestion>>(['suggestions'], suggestions => suggestions
          ? suggestions.filter((suggestion) => suggestion.account_id !== accountId)
          : undefined);

        // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
        return dispatch(blockAccountSuccess(response, getState().statuses));
      }).catch(error => dispatch(blockAccountFail(error)));
  };

const unblockAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    return getClient(getState).filtering.unblockAccount(accountId)
      .then(response => {
        dispatch(importEntities({ relationships: [response] }));
      });
  };

const blockAccountRequest = (accountId: string) => ({
  type: ACCOUNT_BLOCK_REQUEST,
  accountId,
});

const blockAccountSuccess = (relationship: Relationship, statuses: Record<string, MinifiedStatus>) => ({
  type: ACCOUNT_BLOCK_SUCCESS,
  relationship,
  statuses,
});

const blockAccountFail = (error: unknown) => ({
  type: ACCOUNT_BLOCK_FAIL,
  error,
});

const muteAccount = (accountId: string, notifications?: boolean, duration = 0) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const client = getClient(getState);

    dispatch(muteAccountRequest(accountId));

    const params: Record<string, any> = {
      notifications,
    };

    if (duration) {
      const v = client.features.version;

      if (v.software === PLEROMA) {
        params.expires_in = duration;
      } else {
        params.duration = duration;
      }
    }

    return client.filtering.muteAccount(accountId, params)
      .then(response => {
        dispatch(importEntities({ relationships: [response] }));

        queryClient.setQueryData<Array<MinifiedSuggestion>>(['suggestions'], suggestions => suggestions
          ? suggestions.filter((suggestion) => suggestion.account_id !== accountId)
          : undefined);

        // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
        return dispatch(muteAccountSuccess(response, getState().statuses));
      })
      .catch(error => dispatch(muteAccountFail(accountId, error)));
  };

const unmuteAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    return getClient(getState()).filtering.unmuteAccount(accountId)
      .then(response => dispatch(importEntities({ relationships: [response] })));
  };

const muteAccountRequest = (accountId: string) => ({
  type: ACCOUNT_MUTE_REQUEST,
  accountId,
});

const muteAccountSuccess = (relationship: Relationship, statuses: Record<string, MinifiedStatus>) => ({
  type: ACCOUNT_MUTE_SUCCESS,
  relationship,
  statuses,
});

const muteAccountFail = (accountId: string, error: unknown) => ({
  type: ACCOUNT_MUTE_FAIL,
  accountId,
  error,
});

const removeFromFollowers = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    return getClient(getState()).accounts.removeAccountFromFollowers(accountId)
      .then(response => dispatch(importEntities({ relationships: [response] })));
  };

const fetchRelationships = (accountIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const loadedRelationships = getState().entities[Entities.RELATIONSHIPS]?.store;
    const newAccountIds = accountIds.filter(id => !loadedRelationships?.[id]);

    if (newAccountIds.length === 0) {
      return null;
    }

    return getClient(getState()).accounts.getRelationships(newAccountIds)
      .then(response => dispatch(importEntities({ relationships: response })));
  };

const pinAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp);

    return getClient(getState).accounts.pinAccount(accountId).then(response =>
      dispatch(importEntities({ relationships: [response] })),
    );
  };

const unpinAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp);

    return getClient(getState).accounts.unpinAccount(accountId).then(response =>
      dispatch(importEntities({ relationships: [response] })),
    );
  };

interface NotificationSettingsRequestAction {
  type: typeof NOTIFICATION_SETTINGS_REQUEST;
  params: UpdateNotificationSettingsParams;
}

interface NotificationSettingsSuccessAction {
  type: typeof NOTIFICATION_SETTINGS_SUCCESS;
  params: UpdateNotificationSettingsParams;
  data: Awaited<ReturnType<(InstanceType<typeof PlApiClient>)['settings']['updateNotificationSettings']>>;
}

interface NotificationSettingsFailAction {
  type: typeof NOTIFICATION_SETTINGS_FAIL;
  params: UpdateNotificationSettingsParams;
  error: unknown;
}

const updateNotificationSettings = (params: UpdateNotificationSettingsParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<NotificationSettingsRequestAction>({ type: NOTIFICATION_SETTINGS_REQUEST, params });
    return getClient(getState).settings.updateNotificationSettings(params).then((data) => {
      dispatch<NotificationSettingsSuccessAction>({ type: NOTIFICATION_SETTINGS_SUCCESS, params, data });
    }).catch(error => {
      dispatch<NotificationSettingsFailAction>({ type: NOTIFICATION_SETTINGS_FAIL, params, error });
      throw error;
    });
  };

interface AccountSearchRequestAction {
  type: typeof ACCOUNT_SEARCH_REQUEST;
  params: {
    q: string;
  };
}

interface AccountSearchSuccessAction {
  type: typeof ACCOUNT_SEARCH_SUCCESS;
  accounts: Array<Account>;
}

interface AccountSearchFailAction {
  type: typeof ACCOUNT_SEARCH_FAIL;
  skipAlert: true;
}

const accountSearch = (q: string, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<AccountSearchRequestAction>({ type: ACCOUNT_SEARCH_REQUEST, params: { q } });
    return getClient(getState()).accounts.searchAccounts(q, { resolve: false, limit: 4, following: true }, { signal }).then((accounts) => {
      dispatch(importEntities({ accounts }));
      dispatch<AccountSearchSuccessAction>({ type: ACCOUNT_SEARCH_SUCCESS, accounts });
      return accounts;
    }).catch(error => {
      dispatch<AccountSearchFailAction>({ type: ACCOUNT_SEARCH_FAIL, skipAlert: true });
      throw error;
    });
  };

interface AccountLookupRequestAction {
  type: typeof ACCOUNT_LOOKUP_REQUEST;
  acct: string;
}

interface AccountLookupSuccessAction {
  type: typeof ACCOUNT_LOOKUP_SUCCESS;
  account: Account;
}

interface AccountLookupFailAction {
  type: typeof ACCOUNT_LOOKUP_FAIL;
}

const accountLookup = (acct: string, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<AccountLookupRequestAction>({ type: ACCOUNT_LOOKUP_REQUEST, acct });
    return getClient(getState()).accounts.lookupAccount(acct, { signal }).then((account) => {
      if (account && account.id) dispatch(importEntities({ accounts: [account] }));
      dispatch<AccountLookupSuccessAction>({ type: ACCOUNT_LOOKUP_SUCCESS, account });
      return account;
    }).catch(error => {
      dispatch<AccountLookupFailAction>({ type: ACCOUNT_LOOKUP_FAIL });
      throw error;
    });
  };

const biteAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const client = getClient(getState);

    return client.accounts.biteAccount(accountId);
  };

type AccountsAction =
  | AccountCreateRequestAction
  | AccountCreateSuccessAction
  | AccountCreateFailAction
  | ReturnType<typeof fetchAccountRequest>
  | ReturnType<typeof fetchAccountSuccess>
  | ReturnType<typeof fetchAccountFail>
  | ReturnType<typeof blockAccountRequest>
  | ReturnType<typeof blockAccountSuccess>
  | ReturnType<typeof blockAccountFail>
  | ReturnType<typeof muteAccountRequest>
  | ReturnType<typeof muteAccountSuccess>
  | ReturnType<typeof muteAccountFail>
  | NotificationSettingsRequestAction
  | NotificationSettingsSuccessAction
  | NotificationSettingsFailAction
  | AccountSearchRequestAction
  | AccountSearchSuccessAction
  | AccountSearchFailAction
  | AccountLookupRequestAction
  | AccountLookupSuccessAction
  | AccountLookupFailAction;

export {
  ACCOUNT_CREATE_REQUEST,
  ACCOUNT_CREATE_SUCCESS,
  ACCOUNT_CREATE_FAIL,
  ACCOUNT_FETCH_REQUEST,
  ACCOUNT_FETCH_SUCCESS,
  ACCOUNT_FETCH_FAIL,
  ACCOUNT_BLOCK_REQUEST,
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_BLOCK_FAIL,
  ACCOUNT_MUTE_REQUEST,
  ACCOUNT_MUTE_SUCCESS,
  ACCOUNT_MUTE_FAIL,
  ACCOUNT_SEARCH_REQUEST,
  ACCOUNT_SEARCH_SUCCESS,
  ACCOUNT_SEARCH_FAIL,
  ACCOUNT_LOOKUP_REQUEST,
  ACCOUNT_LOOKUP_SUCCESS,
  ACCOUNT_LOOKUP_FAIL,
  NOTIFICATION_SETTINGS_REQUEST,
  NOTIFICATION_SETTINGS_SUCCESS,
  NOTIFICATION_SETTINGS_FAIL,
  createAccount,
  fetchAccount,
  fetchAccountByUsername,
  blockAccount,
  unblockAccount,
  muteAccount,
  unmuteAccount,
  removeFromFollowers,
  fetchRelationships,
  pinAccount,
  unpinAccount,
  updateNotificationSettings,
  accountSearch,
  accountLookup,
  biteAccount,
  type AccountsAction,
};
