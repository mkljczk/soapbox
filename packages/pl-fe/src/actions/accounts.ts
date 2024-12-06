import {
  PLEROMA,
  type UpdateNotificationSettingsParams,
  type CreateAccountParams,
  type Relationship,
} from 'pl-api';

import { Entities } from 'pl-fe/entity-store/entities';
import { queryClient } from 'pl-fe/queries/client';
import { selectAccount } from 'pl-fe/selectors';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient, type PlfeResponse } from '../api';

import { importEntities } from './importer';

import type { MinifiedSuggestion } from 'pl-fe/queries/trends/use-suggested-accounts';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';
import type { AppDispatch, RootState } from 'pl-fe/store';
import type { History } from 'pl-fe/types/history';

const ACCOUNT_BLOCK_SUCCESS = 'ACCOUNT_BLOCK_SUCCESS' as const;

const ACCOUNT_MUTE_SUCCESS = 'ACCOUNT_MUTE_SUCCESS' as const;

const maybeRedirectLogin = (error: { response: PlfeResponse }, history?: History) => {
  // The client is unauthorized - redirect to login.
  if (history && error?.response?.status === 401) {
    history.push('/login');
  }
};

const noOp = () => new Promise(f => f(undefined));

const createAccount = (params: CreateAccountParams) =>
  async (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).settings.createAccount(params).then((token) =>
      ({ params, token }),
    );

const fetchAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchRelationships([accountId]));

    const account = selectAccount(getState(), accountId);

    if (account) {
      return Promise.resolve(null);
    }

    return getClient(getState()).accounts.getAccount(accountId)
      .then(response => {
        dispatch(importEntities({ accounts: [response] }));
      })
      .catch(error => {
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
      });
    } else if (features.accountLookup) {
      return dispatch(accountLookup(username)).then(account => {
        dispatch(fetchRelationships([account.id]));
      }).catch(error => {
        maybeRedirectLogin(error, history);
      });
    } else {
      return getClient(getState()).accounts.searchAccounts(username, { resolve: true, limit: 1 }).then(accounts => {
        const found = accounts.find((a) => a.acct === username);

        if (found) {
          dispatch(fetchRelationships([found.id]));
        } else {
          throw accounts;
        }
      });
    }
  };

const blockAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    return getClient(getState).filtering.blockAccount(accountId)
      .then(response => {
        dispatch(importEntities({ relationships: [response] }));

        queryClient.setQueryData<Array<MinifiedSuggestion>>(['suggestions'], suggestions => suggestions
          ? suggestions.filter((suggestion) => suggestion.account_id !== accountId)
          : undefined);

        // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
        return dispatch(blockAccountSuccess(response, getState().statuses));
      });
  };

const unblockAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    return getClient(getState).filtering.unblockAccount(accountId)
      .then(response => {
        dispatch(importEntities({ relationships: [response] }));
      });
  };

const blockAccountSuccess = (relationship: Relationship, statuses: Record<string, MinifiedStatus>) => ({
  type: ACCOUNT_BLOCK_SUCCESS,
  relationship,
  statuses,
});


const muteAccount = (accountId: string, notifications?: boolean, duration = 0) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const client = getClient(getState);

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
      });
  };

const unmuteAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    return getClient(getState()).filtering.unmuteAccount(accountId)
      .then(response => dispatch(importEntities({ relationships: [response] })));
  };

const muteAccountSuccess = (relationship: Relationship, statuses: Record<string, MinifiedStatus>) => ({
  type: ACCOUNT_MUTE_SUCCESS,
  relationship,
  statuses,
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

const updateNotificationSettings = (params: UpdateNotificationSettingsParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.updateNotificationSettings(params).then((data) => ({ params, data }));

const accountSearch = (q: string, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).accounts.searchAccounts(q, { resolve: false, limit: 4, following: true }, { signal }).then((accounts) => {
      dispatch(importEntities({ accounts }));
      return accounts;
    });

const accountLookup = (acct: string, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).accounts.lookupAccount(acct, { signal }).then((account) => {
      if (account && account.id) dispatch(importEntities({ accounts: [account] }));
      return account;
    });

const biteAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).accounts.biteAccount(accountId);

type AccountsAction =
  | ReturnType<typeof blockAccountSuccess>
  | ReturnType<typeof muteAccountSuccess>;

export {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
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
