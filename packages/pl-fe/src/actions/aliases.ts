import { defineMessages } from 'react-intl';

import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import { importEntities } from './importer';

import type { Account as BaseAccount } from 'pl-api';
import type { Account } from 'pl-fe/normalizers/account';
import type { AppDispatch, RootState } from 'pl-fe/store';

const ALIASES_FETCH_SUCCESS = 'ALIASES_FETCH_SUCCESS' as const;

const ALIASES_SUGGESTIONS_CHANGE = 'ALIASES_SUGGESTIONS_CHANGE' as const;
const ALIASES_SUGGESTIONS_READY = 'ALIASES_SUGGESTIONS_READY' as const;
const ALIASES_SUGGESTIONS_CLEAR = 'ALIASES_SUGGESTIONS_CLEAR' as const;

const messages = defineMessages({
  createSuccess: { id: 'aliases.success.add', defaultMessage: 'Account alias created successfully' },
  removeSuccess: { id: 'aliases.success.remove', defaultMessage: 'Account alias removed successfully' },
});

const fetchAliases = (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState).settings.getAccountAliases()
    .then(response => {
      dispatch(fetchAliasesSuccess(response.aliases));
    });
};

const fetchAliasesSuccess = (aliases: Array<string>) => ({
  type: ALIASES_FETCH_SUCCESS,
  value: aliases,
});

const fetchAliasesSuggestions = (q: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState()).accounts.searchAccounts(q, { resolve: true, limit: 4 })
      .then((data) => {
        dispatch(importEntities({ accounts: data }));
        dispatch(fetchAliasesSuggestionsReady(q, data));
      }).catch(error => toast.showAlertForError(error));
  };

const fetchAliasesSuggestionsReady = (query: string, accounts: BaseAccount[]) => ({
  type: ALIASES_SUGGESTIONS_READY,
  query,
  accounts,
});

const clearAliasesSuggestions = () => ({
  type: ALIASES_SUGGESTIONS_CLEAR,
});

const changeAliasesSuggestions = (value: string) => ({
  type: ALIASES_SUGGESTIONS_CHANGE,
  value,
});

const addToAliases = (account: Account) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState).settings.addAccountAlias(account.acct).then(() => {
      toast.success(messages.createSuccess);
      dispatch(fetchAliases);
    });
  };

const removeFromAliases = (account: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState).settings.deleteAccountAlias(account).then(() => {
      toast.success(messages.removeSuccess);
    });
  };

type AliasesAction =
  | ReturnType<typeof fetchAliasesSuccess>
  | ReturnType<typeof fetchAliasesSuggestionsReady>
  | ReturnType<typeof clearAliasesSuggestions>
  | ReturnType<typeof changeAliasesSuggestions>

export {
  ALIASES_FETCH_SUCCESS,
  ALIASES_SUGGESTIONS_CHANGE,
  ALIASES_SUGGESTIONS_READY,
  ALIASES_SUGGESTIONS_CLEAR,
  fetchAliases,
  fetchAliasesSuggestions,
  clearAliasesSuggestions,
  changeAliasesSuggestions,
  addToAliases,
  removeFromAliases,
  type AliasesAction,
};
