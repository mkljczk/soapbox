import { selectAccount } from 'pl-fe/selectors';
import { setSentryAccount } from 'pl-fe/sentry';
import KVStore from 'pl-fe/storage/kv-store';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { getAuthUserId, getAuthUserUrl } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import { loadCredentials } from './auth';
import { importEntities } from './importer';
import { FE_NAME } from './settings';

import type { CredentialAccount, UpdateCredentialsParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const ME_FETCH_REQUEST = 'ME_FETCH_REQUEST' as const;
const ME_FETCH_SUCCESS = 'ME_FETCH_SUCCESS' as const;
const ME_FETCH_FAIL = 'ME_FETCH_FAIL' as const;
const ME_FETCH_SKIP = 'ME_FETCH_SKIP' as const;

const ME_PATCH_REQUEST = 'ME_PATCH_REQUEST' as const;
const ME_PATCH_SUCCESS = 'ME_PATCH_SUCCESS' as const;
const ME_PATCH_FAIL = 'ME_PATCH_FAIL' as const;

const noOp = () => new Promise(f => f(undefined));

const getMeId = (state: RootState) => state.me || getAuthUserId(state);

const getMeUrl = (state: RootState) => {
  const accountId = getMeId(state);
  if (accountId) {
    return selectAccount(state, accountId)?.url || getAuthUserUrl(state);
  }
};

const getMeToken = (state: RootState) => {
  // Fallback for upgrading IDs to URLs
  const accountUrl = getMeUrl(state) || state.auth.me;
  return state.auth.users[accountUrl!]?.access_token;
};

interface MeFetchSkipAction {
  type: typeof ME_FETCH_SKIP;
}

const fetchMe = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const token = getMeToken(state);
    const accountUrl = getMeUrl(state);

    if (!token) {
      dispatch<MeFetchSkipAction>({ type: ME_FETCH_SKIP });
      return noOp();
    }

    dispatch(fetchMeRequest());
    return dispatch(loadCredentials(token, accountUrl!))
      .catch(error => dispatch(fetchMeFail(error)));
  };

/** Update the auth account in IndexedDB for Mastodon, etc. */
const persistAuthAccount = (account: CredentialAccount, params: Record<string, any>) => {
  if (account && account.url) {
    const key = `authAccount:${account.url}`;
    KVStore.getItem(key).then((oldAccount: any) => {
      const settings = oldAccount?.settings_store || {};
      if (!account.settings_store) {
        account.settings_store = settings;
      }
      KVStore.setItem(key, account);
    })
      .catch(console.error);
  }
  if (account && account.url) {
    if (!account.settings_store) {
      account.settings_store = params.pleroma_settings_store || {};
    }
    KVStore.setItem(`authAccount:${account.url}`, account).catch(console.error);
  }
};

const patchMe = (params: UpdateCredentialsParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(patchMeRequest());

    return getClient(getState).settings.updateCredentials(params)
      .then(response => {
        persistAuthAccount(response, params);
        dispatch(patchMeSuccess(response));
      }).catch(error => {
        dispatch(patchMeFail(error));
        throw error;
      });
  };

const fetchMeRequest = () => ({
  type: ME_FETCH_REQUEST,
});

const fetchMeSuccess = (account: CredentialAccount) => {
  setSentryAccount(account);

  useSettingsStore.getState().loadUserSettings(account.settings_store?.[FE_NAME]);

  return {
    type: ME_FETCH_SUCCESS,
    me: account,
  };
};

const fetchMeFail = (error: unknown) => ({
  type: ME_FETCH_FAIL,
  error,
  skipAlert: true,
});

const patchMeRequest = () => ({
  type: ME_PATCH_REQUEST,
});

interface MePatchSuccessAction {
  type: typeof ME_PATCH_SUCCESS;
  me: CredentialAccount;
}

const patchMeSuccess = (me: CredentialAccount) =>
  (dispatch: AppDispatch) => {
    dispatch(importEntities({ accounts: [me] }));
    dispatch<MePatchSuccessAction>({
      type: ME_PATCH_SUCCESS,
      me,
    });
  };

const patchMeFail = (error: unknown) => ({
  type: ME_PATCH_FAIL,
  error,
  skipAlert: true,
});

type MeAction =
  | ReturnType<typeof fetchMeRequest>
  | ReturnType<typeof fetchMeSuccess>
  | ReturnType<typeof fetchMeFail>
  | MeFetchSkipAction
  | ReturnType<typeof patchMeRequest>
  | MePatchSuccessAction
  | ReturnType<typeof patchMeFail>;

export {
  ME_FETCH_REQUEST,
  ME_FETCH_SUCCESS,
  ME_FETCH_FAIL,
  ME_FETCH_SKIP,
  ME_PATCH_REQUEST,
  ME_PATCH_SUCCESS,
  ME_PATCH_FAIL,
  fetchMe,
  patchMe,
  fetchMeSuccess,
  fetchMeFail,
  patchMeSuccess,
  type MeAction,
};
