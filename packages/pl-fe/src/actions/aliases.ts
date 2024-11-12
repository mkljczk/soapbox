import { importEntities } from 'pl-hooks';
import { defineMessages } from 'react-intl';

import { getClient } from 'pl-fe/api';
import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import type { Account as BaseAccount } from 'pl-api';
import type { Account } from 'pl-fe/normalizers/account';
import type { AppDispatch, RootState } from 'pl-fe/store';

const ALIASES_FETCH_REQUEST = 'ALIASES_FETCH_REQUEST' as const;
const ALIASES_FETCH_SUCCESS = 'ALIASES_FETCH_SUCCESS' as const;
const ALIASES_FETCH_FAIL = 'ALIASES_FETCH_FAIL' as const;

const ALIASES_SUGGESTIONS_CHANGE = 'ALIASES_SUGGESTIONS_CHANGE' as const;
const ALIASES_SUGGESTIONS_READY = 'ALIASES_SUGGESTIONS_READY' as const;
const ALIASES_SUGGESTIONS_CLEAR = 'ALIASES_SUGGESTIONS_CLEAR' as const;

const ALIASES_ADD_REQUEST = 'ALIASES_ADD_REQUEST' as const;
const ALIASES_ADD_SUCCESS = 'ALIASES_ADD_SUCCESS' as const;
const ALIASES_ADD_FAIL = 'ALIASES_ADD_FAIL' as const;

const ALIASES_REMOVE_REQUEST = 'ALIASES_REMOVE_REQUEST' as const;
const ALIASES_REMOVE_SUCCESS = 'ALIASES_REMOVE_SUCCESS' as const;
const ALIASES_REMOVE_FAIL = 'ALIASES_REMOVE_FAIL' as const;

const messages = defineMessages({
  createSuccess: { id: 'aliases.success.add', defaultMessage: 'Account alias created successfully' },
  removeSuccess: { id: 'aliases.success.remove', defaultMessage: 'Account alias removed successfully' },
});

const fetchAliases = (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;
  dispatch(fetchAliasesRequest());

  return getClient(getState).settings.getAccountAliases()
    .then(response => {
      dispatch(fetchAliasesSuccess(response.aliases));
    })
    .catch(err => dispatch(fetchAliasesFail(err)));
};

const fetchAliasesRequest = () => ({
  type: ALIASES_FETCH_REQUEST,
});

const fetchAliasesSuccess = (aliases: Array<string>) => ({
  type: ALIASES_FETCH_SUCCESS,
  value: aliases,
});

const fetchAliasesFail = (error: unknown) => ({
  type: ALIASES_FETCH_FAIL,
  error,
});

const fetchAliasesSuggestions = (q: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState()).accounts.searchAccounts(q, { resolve: true, limit: 4 })
      .then((data) => {
        importEntities({ accounts: data });
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
    dispatch(addToAliasesRequest());

    return getClient(getState).settings.addAccountAlias(account.acct).then(() => {
      toast.success(messages.createSuccess);
      dispatch(addToAliasesSuccess);
      dispatch(fetchAliases);
    })
      .catch(err => dispatch(fetchAliasesFail(err)));
  };

const addToAliasesRequest = () => ({
  type: ALIASES_ADD_REQUEST,
});

const addToAliasesSuccess = () => ({
  type: ALIASES_ADD_SUCCESS,
});

const addToAliasesFail = (error: unknown) => ({
  type: ALIASES_ADD_FAIL,
  error,
});

const removeFromAliases = (account: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;
    dispatch(addToAliasesRequest());

    return getClient(getState).settings.deleteAccountAlias(account).then(() => {
      toast.success(messages.removeSuccess);
      dispatch(removeFromAliasesSuccess);
      dispatch(fetchAliases);
    }).catch(err => dispatch(fetchAliasesFail(err)));
  };

const removeFromAliasesRequest = () => ({
  type: ALIASES_REMOVE_REQUEST,
});

const removeFromAliasesSuccess = () => ({
  type: ALIASES_REMOVE_SUCCESS,
});

const removeFromAliasesFail = (error: unknown) => ({
  type: ALIASES_REMOVE_FAIL,
  error,
});

type AliasesAction =
  ReturnType<typeof fetchAliasesRequest>
  | ReturnType<typeof fetchAliasesSuccess>
  | ReturnType<typeof fetchAliasesFail>
  | ReturnType<typeof fetchAliasesSuggestionsReady>
  | ReturnType<typeof clearAliasesSuggestions>
  | ReturnType<typeof changeAliasesSuggestions>
  | ReturnType<typeof addToAliasesRequest>
  | ReturnType<typeof addToAliasesSuccess>
  | ReturnType<typeof addToAliasesFail>
  | ReturnType<typeof removeFromAliasesRequest>
  | ReturnType<typeof removeFromAliasesSuccess>
  | ReturnType<typeof removeFromAliasesFail>;

export {
  ALIASES_FETCH_REQUEST,
  ALIASES_FETCH_SUCCESS,
  ALIASES_FETCH_FAIL,
  ALIASES_SUGGESTIONS_CHANGE,
  ALIASES_SUGGESTIONS_READY,
  ALIASES_SUGGESTIONS_CLEAR,
  ALIASES_ADD_REQUEST,
  ALIASES_ADD_SUCCESS,
  ALIASES_ADD_FAIL,
  ALIASES_REMOVE_REQUEST,
  ALIASES_REMOVE_SUCCESS,
  ALIASES_REMOVE_FAIL,
  fetchAliases,
  fetchAliasesRequest,
  fetchAliasesSuccess,
  fetchAliasesFail,
  fetchAliasesSuggestions,
  fetchAliasesSuggestionsReady,
  clearAliasesSuggestions,
  changeAliasesSuggestions,
  addToAliases,
  addToAliasesRequest,
  addToAliasesSuccess,
  addToAliasesFail,
  removeFromAliases,
  removeFromAliasesRequest,
  removeFromAliasesSuccess,
  removeFromAliasesFail,
  type AliasesAction,
};
