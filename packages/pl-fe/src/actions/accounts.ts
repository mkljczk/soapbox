import {
  PLEROMA,
  type UpdateNotificationSettingsParams,
  type Account,
  type CreateAccountParams,
  type PaginatedResponse,
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
import type { Me } from 'pl-fe/types/pl-fe';

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

const PINNED_ACCOUNTS_FETCH_REQUEST = 'PINNED_ACCOUNTS_FETCH_REQUEST' as const;
const PINNED_ACCOUNTS_FETCH_SUCCESS = 'PINNED_ACCOUNTS_FETCH_SUCCESS' as const;
const PINNED_ACCOUNTS_FETCH_FAIL = 'PINNED_ACCOUNTS_FETCH_FAIL' as const;

const ACCOUNT_SEARCH_REQUEST = 'ACCOUNT_SEARCH_REQUEST' as const;
const ACCOUNT_SEARCH_SUCCESS = 'ACCOUNT_SEARCH_SUCCESS' as const;
const ACCOUNT_SEARCH_FAIL = 'ACCOUNT_SEARCH_FAIL' as const;

const ACCOUNT_LOOKUP_REQUEST = 'ACCOUNT_LOOKUP_REQUEST' as const;
const ACCOUNT_LOOKUP_SUCCESS = 'ACCOUNT_LOOKUP_SUCCESS' as const;
const ACCOUNT_LOOKUP_FAIL = 'ACCOUNT_LOOKUP_FAIL' as const;

const FOLLOW_REQUESTS_FETCH_REQUEST = 'FOLLOW_REQUESTS_FETCH_REQUEST' as const;
const FOLLOW_REQUESTS_FETCH_SUCCESS = 'FOLLOW_REQUESTS_FETCH_SUCCESS' as const;
const FOLLOW_REQUESTS_FETCH_FAIL = 'FOLLOW_REQUESTS_FETCH_FAIL' as const;

const FOLLOW_REQUESTS_EXPAND_REQUEST = 'FOLLOW_REQUESTS_EXPAND_REQUEST' as const;
const FOLLOW_REQUESTS_EXPAND_SUCCESS = 'FOLLOW_REQUESTS_EXPAND_SUCCESS' as const;
const FOLLOW_REQUESTS_EXPAND_FAIL = 'FOLLOW_REQUESTS_EXPAND_FAIL' as const;

const FOLLOW_REQUEST_AUTHORIZE_REQUEST = 'FOLLOW_REQUEST_AUTHORIZE_REQUEST' as const;
const FOLLOW_REQUEST_AUTHORIZE_SUCCESS = 'FOLLOW_REQUEST_AUTHORIZE_SUCCESS' as const;
const FOLLOW_REQUEST_AUTHORIZE_FAIL = 'FOLLOW_REQUEST_AUTHORIZE_FAIL' as const;

const FOLLOW_REQUEST_REJECT_REQUEST = 'FOLLOW_REQUEST_REJECT_REQUEST' as const;
const FOLLOW_REQUEST_REJECT_SUCCESS = 'FOLLOW_REQUEST_REJECT_SUCCESS' as const;
const FOLLOW_REQUEST_REJECT_FAIL = 'FOLLOW_REQUEST_REJECT_FAIL' as const;

const NOTIFICATION_SETTINGS_REQUEST = 'NOTIFICATION_SETTINGS_REQUEST' as const;
const NOTIFICATION_SETTINGS_SUCCESS = 'NOTIFICATION_SETTINGS_SUCCESS' as const;
const NOTIFICATION_SETTINGS_FAIL = 'NOTIFICATION_SETTINGS_FAIL' as const;

const BIRTHDAY_REMINDERS_FETCH_REQUEST = 'BIRTHDAY_REMINDERS_FETCH_REQUEST' as const;
const BIRTHDAY_REMINDERS_FETCH_SUCCESS = 'BIRTHDAY_REMINDERS_FETCH_SUCCESS' as const;
const BIRTHDAY_REMINDERS_FETCH_FAIL = 'BIRTHDAY_REMINDERS_FETCH_FAIL' as const;

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

const fetchFollowRequests = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(fetchFollowRequestsRequest());

    return getClient(getState()).myAccount.getFollowRequests()
      .then(response => {
        dispatch(importEntities({ accounts: response.items }));
        dispatch(fetchFollowRequestsSuccess(response.items, response.next));
      })
      .catch(error => dispatch(fetchFollowRequestsFail(error)));
  };

const fetchFollowRequestsRequest = () => ({
  type: FOLLOW_REQUESTS_FETCH_REQUEST,
});

const fetchFollowRequestsSuccess = (accounts: Array<Account>, next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: FOLLOW_REQUESTS_FETCH_SUCCESS,
  accounts,
  next,
});

const fetchFollowRequestsFail = (error: unknown) => ({
  type: FOLLOW_REQUESTS_FETCH_FAIL,
  error,
});

const expandFollowRequests = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const next = getState().user_lists.follow_requests.next;

    if (next === null) return null;

    dispatch(expandFollowRequestsRequest());

    return next().then(response => {
      dispatch(importEntities({ accounts: response.items }));
      dispatch(expandFollowRequestsSuccess(response.items, response.next));
    }).catch(error => dispatch(expandFollowRequestsFail(error)));
  };

const expandFollowRequestsRequest = () => ({
  type: FOLLOW_REQUESTS_EXPAND_REQUEST,
});

const expandFollowRequestsSuccess = (accounts: Array<Account>, next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: FOLLOW_REQUESTS_EXPAND_SUCCESS,
  accounts,
  next,
});

const expandFollowRequestsFail = (error: unknown) => ({
  type: FOLLOW_REQUESTS_EXPAND_FAIL,
  error,
});

const authorizeFollowRequest = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(authorizeFollowRequestRequest(accountId));

    return getClient(getState()).myAccount.acceptFollowRequest(accountId)
      .then(() => dispatch(authorizeFollowRequestSuccess(accountId)))
      .catch(error => dispatch(authorizeFollowRequestFail(accountId, error)));
  };

const authorizeFollowRequestRequest = (accountId: string) => ({
  type: FOLLOW_REQUEST_AUTHORIZE_REQUEST,
  accountId,
});

const authorizeFollowRequestSuccess = (accountId: string) => ({
  type: FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  accountId,
});

const authorizeFollowRequestFail = (accountId: string, error: unknown) => ({
  type: FOLLOW_REQUEST_AUTHORIZE_FAIL,
  accountId,
  error,
});

const rejectFollowRequest = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(rejectFollowRequestRequest(accountId));

    return getClient(getState()).myAccount.rejectFollowRequest(accountId)
      .then(() => dispatch(rejectFollowRequestSuccess(accountId)))
      .catch(error => dispatch(rejectFollowRequestFail(accountId, error)));
  };

const rejectFollowRequestRequest = (accountId: string) => ({
  type: FOLLOW_REQUEST_REJECT_REQUEST,
  accountId,
});

const rejectFollowRequestSuccess = (accountId: string) => ({
  type: FOLLOW_REQUEST_REJECT_SUCCESS,
  accountId,
});

const rejectFollowRequestFail = (accountId: string, error: unknown) => ({
  type: FOLLOW_REQUEST_REJECT_FAIL,
  accountId,
  error,
});

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

const fetchPinnedAccounts = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchPinnedAccountsRequest(accountId));

    return getClient(getState).accounts.getAccountEndorsements(accountId).then(response => {
      dispatch(importEntities({ accounts: response }));
      dispatch(fetchPinnedAccountsSuccess(accountId, response, null));
    }).catch(error => {
      dispatch(fetchPinnedAccountsFail(accountId, error));
    });
  };

const fetchPinnedAccountsRequest = (accountId: string) => ({
  type: PINNED_ACCOUNTS_FETCH_REQUEST,
  accountId,
});

const fetchPinnedAccountsSuccess = (accountId: string, accounts: Array<Account>, next: null) => ({
  type: PINNED_ACCOUNTS_FETCH_SUCCESS,
  accountId,
  accounts,
  next,
});

const fetchPinnedAccountsFail = (accountId: string, error: unknown) => ({
  type: PINNED_ACCOUNTS_FETCH_FAIL,
  accountId,
  error,
});

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

interface BirthdayRemindersFetchRequestAction {
  type: typeof BIRTHDAY_REMINDERS_FETCH_REQUEST;
  day: number;
  month: number;
  accountId: Me;
}

interface BirthdayRemindersFetchSuccessAction {
  type: typeof BIRTHDAY_REMINDERS_FETCH_SUCCESS;
  day: number;
  month: number;
  accountId: string;
  accounts: Array<Account>;
}

interface BirthdayRemindersFetchFailAction {
  type: typeof BIRTHDAY_REMINDERS_FETCH_FAIL;
  day: number;
  month: number;
  accountId: Me;
}

const fetchBirthdayReminders = (month: number, day: number) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const me = getState().me as string;

    dispatch<BirthdayRemindersFetchRequestAction>({ type: BIRTHDAY_REMINDERS_FETCH_REQUEST, day, month, accountId: me });

    return getClient(getState).accounts.getBirthdays(day, month).then(response => {
      dispatch(importEntities({ accounts: response }));
      dispatch<BirthdayRemindersFetchSuccessAction>({
        type: BIRTHDAY_REMINDERS_FETCH_SUCCESS,
        accounts: response,
        day,
        month,
        accountId: me,
      });
    }).catch(() => {
      dispatch<BirthdayRemindersFetchFailAction>({ type: BIRTHDAY_REMINDERS_FETCH_FAIL, day, month, accountId: me });
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
  | ReturnType<typeof fetchFollowRequestsRequest>
  | ReturnType<typeof fetchFollowRequestsSuccess>
  | ReturnType<typeof fetchFollowRequestsFail>
  | ReturnType<typeof expandFollowRequestsRequest>
  | ReturnType<typeof expandFollowRequestsSuccess>
  | ReturnType<typeof expandFollowRequestsFail>
  | ReturnType<typeof authorizeFollowRequestRequest>
  | ReturnType<typeof authorizeFollowRequestSuccess>
  | ReturnType<typeof authorizeFollowRequestFail>
  | ReturnType<typeof rejectFollowRequestRequest>
  | ReturnType<typeof rejectFollowRequestSuccess>
  | ReturnType<typeof rejectFollowRequestFail>
  | NotificationSettingsRequestAction
  | NotificationSettingsSuccessAction
  | NotificationSettingsFailAction
  | ReturnType<typeof fetchPinnedAccountsRequest>
  | ReturnType<typeof fetchPinnedAccountsSuccess>
  | ReturnType<typeof fetchPinnedAccountsFail>
  | AccountSearchRequestAction
  | AccountSearchSuccessAction
  | AccountSearchFailAction
  | AccountLookupRequestAction
  | AccountLookupSuccessAction
  | AccountLookupFailAction
  | BirthdayRemindersFetchSuccessAction
  | BirthdayRemindersFetchRequestAction
  | BirthdayRemindersFetchFailAction

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
  PINNED_ACCOUNTS_FETCH_REQUEST,
  PINNED_ACCOUNTS_FETCH_SUCCESS,
  PINNED_ACCOUNTS_FETCH_FAIL,
  ACCOUNT_SEARCH_REQUEST,
  ACCOUNT_SEARCH_SUCCESS,
  ACCOUNT_SEARCH_FAIL,
  ACCOUNT_LOOKUP_REQUEST,
  ACCOUNT_LOOKUP_SUCCESS,
  ACCOUNT_LOOKUP_FAIL,
  FOLLOW_REQUESTS_FETCH_REQUEST,
  FOLLOW_REQUESTS_FETCH_SUCCESS,
  FOLLOW_REQUESTS_FETCH_FAIL,
  FOLLOW_REQUESTS_EXPAND_REQUEST,
  FOLLOW_REQUESTS_EXPAND_SUCCESS,
  FOLLOW_REQUESTS_EXPAND_FAIL,
  FOLLOW_REQUEST_AUTHORIZE_REQUEST,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_FAIL,
  FOLLOW_REQUEST_REJECT_REQUEST,
  FOLLOW_REQUEST_REJECT_SUCCESS,
  FOLLOW_REQUEST_REJECT_FAIL,
  NOTIFICATION_SETTINGS_REQUEST,
  NOTIFICATION_SETTINGS_SUCCESS,
  NOTIFICATION_SETTINGS_FAIL,
  BIRTHDAY_REMINDERS_FETCH_REQUEST,
  BIRTHDAY_REMINDERS_FETCH_SUCCESS,
  BIRTHDAY_REMINDERS_FETCH_FAIL,
  createAccount,
  fetchAccount,
  fetchAccountByUsername,
  blockAccount,
  unblockAccount,
  muteAccount,
  unmuteAccount,
  removeFromFollowers,
  fetchRelationships,
  fetchFollowRequests,
  expandFollowRequests,
  authorizeFollowRequest,
  rejectFollowRequest,
  pinAccount,
  unpinAccount,
  updateNotificationSettings,
  fetchPinnedAccounts,
  accountSearch,
  accountLookup,
  fetchBirthdayReminders,
  biteAccount,
  type AccountsAction,
};
