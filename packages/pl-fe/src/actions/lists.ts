import { selectAccount } from 'pl-fe/selectors';
import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import { importEntities } from './importer';

import type { Account, List, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const LIST_FETCH_SUCCESS = 'LIST_FETCH_SUCCESS' as const;
const LIST_FETCH_FAIL = 'LIST_FETCH_FAIL' as const;

const LISTS_FETCH_SUCCESS = 'LISTS_FETCH_SUCCESS' as const;

const LIST_EDITOR_TITLE_CHANGE = 'LIST_EDITOR_TITLE_CHANGE' as const;
const LIST_EDITOR_RESET = 'LIST_EDITOR_RESET' as const;
const LIST_EDITOR_SETUP = 'LIST_EDITOR_SETUP' as const;

const LIST_CREATE_REQUEST = 'LIST_CREATE_REQUEST' as const;
const LIST_CREATE_SUCCESS = 'LIST_CREATE_SUCCESS' as const;
const LIST_CREATE_FAIL = 'LIST_CREATE_FAIL' as const;

const LIST_UPDATE_REQUEST = 'LIST_UPDATE_REQUEST' as const;
const LIST_UPDATE_SUCCESS = 'LIST_UPDATE_SUCCESS' as const;
const LIST_UPDATE_FAIL = 'LIST_UPDATE_FAIL' as const;

const LIST_DELETE_SUCCESS = 'LIST_DELETE_SUCCESS' as const;

const LIST_ACCOUNTS_FETCH_REQUEST = 'LIST_ACCOUNTS_FETCH_REQUEST' as const;
const LIST_ACCOUNTS_FETCH_SUCCESS = 'LIST_ACCOUNTS_FETCH_SUCCESS' as const;
const LIST_ACCOUNTS_FETCH_FAIL = 'LIST_ACCOUNTS_FETCH_FAIL' as const;

const LIST_EDITOR_SUGGESTIONS_CHANGE = 'LIST_EDITOR_SUGGESTIONS_CHANGE' as const;
const LIST_EDITOR_SUGGESTIONS_READY = 'LIST_EDITOR_SUGGESTIONS_READY' as const;
const LIST_EDITOR_SUGGESTIONS_CLEAR = 'LIST_EDITOR_SUGGESTIONS_CLEAR' as const;

const LIST_EDITOR_ADD_SUCCESS = 'LIST_EDITOR_ADD_SUCCESS' as const;

const LIST_EDITOR_REMOVE_SUCCESS = 'LIST_EDITOR_REMOVE_SUCCESS' as const;

const LIST_ADDER_RESET = 'LIST_ADDER_RESET' as const;
const LIST_ADDER_SETUP = 'LIST_ADDER_SETUP' as const;

const LIST_ADDER_LISTS_FETCH_REQUEST = 'LIST_ADDER_LISTS_FETCH_REQUEST' as const;
const LIST_ADDER_LISTS_FETCH_SUCCESS = 'LIST_ADDER_LISTS_FETCH_SUCCESS' as const;
const LIST_ADDER_LISTS_FETCH_FAIL = 'LIST_ADDER_LISTS_FETCH_FAIL' as const;

const fetchList = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  if (getState().lists[listId]) {
    return;
  }

  return getClient(getState()).lists.getList(listId)
    .then((data) => dispatch(fetchListSuccess(data)))
    .catch(err => dispatch(fetchListFail(listId, err)));
};

const fetchListSuccess = (list: List) => ({
  type: LIST_FETCH_SUCCESS,
  list,
});

const fetchListFail = (listId: string, error: unknown) => ({
  type: LIST_FETCH_FAIL,
  listId,
  error,
});

const fetchLists = () => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).lists.getLists()
    .then((data) => dispatch(fetchListsSuccess(data)));
};

const fetchListsSuccess = (lists: Array<List>) => ({
  type: LISTS_FETCH_SUCCESS,
  lists,
});

const submitListEditor = (shouldReset?: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  const listId = getState().listEditor.listId!;
  const title = getState().listEditor.title;

  if (listId === null) {
    dispatch(createList(title, shouldReset));
  } else {
    dispatch(updateList(listId, title, shouldReset));
  }
};

interface ListEditorSetupAction {
  type: typeof LIST_EDITOR_SETUP;
  list: List;
}

const setupListEditor = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const list = getState().lists[listId];
  if (!list) return;

  dispatch<ListEditorSetupAction>({
    type: LIST_EDITOR_SETUP,
    list,
  });

  dispatch(fetchListAccounts(listId));
};

const changeListEditorTitle = (value: string) => ({
  type: LIST_EDITOR_TITLE_CHANGE,
  value,
});

const createList = (title: string, shouldReset?: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(createListRequest());

  return getClient(getState()).lists.createList({ title }).then((data) => {
    dispatch(createListSuccess(data));

    if (shouldReset) {
      dispatch(resetListEditor());
    }
  }).catch(err => dispatch(createListFail(err)));
};

const createListRequest = () => ({
  type: LIST_CREATE_REQUEST,
});

const createListSuccess = (list: List) => ({
  type: LIST_CREATE_SUCCESS,
  list,
});

const createListFail = (error: unknown) => ({
  type: LIST_CREATE_FAIL,
  error,
});

const updateList = (listId: string, title: string, shouldReset?: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(updateListRequest(listId));

  return getClient(getState()).lists.updateList(listId, { title }).then((data) => {
    dispatch(updateListSuccess(data));

    if (shouldReset) {
      dispatch(resetListEditor());
    }
  }).catch(err => dispatch(updateListFail(listId, err)));
};

const updateListRequest = (listId: string) => ({
  type: LIST_UPDATE_REQUEST,
  listId,
});

const updateListSuccess = (list: List) => ({
  type: LIST_UPDATE_SUCCESS,
  list,
});

const updateListFail = (listId: string, error: unknown) => ({
  type: LIST_UPDATE_FAIL,
  listId,
  error,
});

const resetListEditor = () => ({
  type: LIST_EDITOR_RESET,
});

const deleteList = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).lists.deleteList(listId)
    .then(() => dispatch(deleteListSuccess(listId)));
};

const deleteListSuccess = (listId: string) => ({
  type: LIST_DELETE_SUCCESS,
  listId,
});

const fetchListAccounts = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(fetchListAccountsRequest(listId));

  return getClient(getState()).lists.getListAccounts(listId).then(({ items, next }) => {
    dispatch(importEntities({ accounts: items }));
    dispatch(fetchListAccountsSuccess(listId, items, next));
  }).catch(err => dispatch(fetchListAccountsFail(listId, err)));
};

const fetchListAccountsRequest = (listId: string) => ({
  type: LIST_ACCOUNTS_FETCH_REQUEST,
  listId,
});

const fetchListAccountsSuccess = (listId: string, accounts: Account[], next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: LIST_ACCOUNTS_FETCH_SUCCESS,
  listId,
  accounts,
  next,
});

const fetchListAccountsFail = (listId: string, error: unknown) => ({
  type: LIST_ACCOUNTS_FETCH_FAIL,
  listId,
  error,
});

const fetchListSuggestions = (q: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).accounts.searchAccounts(q, { resolve: false, limit: 4, following: true }).then((data) => {
    dispatch(importEntities({ accounts: data }));
    dispatch(fetchListSuggestionsReady(q, data));
  }).catch(error => toast.showAlertForError(error));
};

const fetchListSuggestionsReady = (query: string, accounts: Array<Account>) => ({
  type: LIST_EDITOR_SUGGESTIONS_READY,
  query,
  accounts,
});

const clearListSuggestions = () => ({
  type: LIST_EDITOR_SUGGESTIONS_CLEAR,
});

const changeListSuggestions = (value: string) => ({
  type: LIST_EDITOR_SUGGESTIONS_CHANGE,
  value,
});

const addToListEditor = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(addToList(getState().listEditor.listId!, accountId));
};

const addToList = (listId: string, accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).lists.addListAccounts(listId, [accountId])
    .then(() => dispatch(addToListSuccess(listId, accountId)));
};

const addToListSuccess = (listId: string, accountId: string) => ({
  type: LIST_EDITOR_ADD_SUCCESS,
  listId,
  accountId,
});

const removeFromListEditor = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(removeFromList(getState().listEditor.listId!, accountId));
};

const removeFromList = (listId: string, accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).lists.deleteListAccounts(listId, [accountId])
    .then(() => dispatch(removeFromListSuccess(listId, accountId)));
};

const removeFromListSuccess = (listId: string, accountId: string) => ({
  type: LIST_EDITOR_REMOVE_SUCCESS,
  listId,
  accountId,
});

const resetListAdder = () => ({
  type: LIST_ADDER_RESET,
});

interface ListAdderSetupAction {
  type: typeof LIST_ADDER_SETUP;
  account: Account;
}

const setupListAdder = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const account = selectAccount(getState(), accountId);
  if (!account) return;

  dispatch<ListAdderSetupAction>({
    type: LIST_ADDER_SETUP,
    account,
  });
  dispatch(fetchLists());
  dispatch(fetchAccountLists(accountId));
};

const fetchAccountLists = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(fetchAccountListsRequest(accountId));

  return getClient(getState()).accounts.getAccountLists(accountId)
    .then((data) => dispatch(fetchAccountListsSuccess(accountId, data)))
    .catch(err => dispatch(fetchAccountListsFail(accountId, err)));
};

const fetchAccountListsRequest = (listId: string) => ({
  type: LIST_ADDER_LISTS_FETCH_REQUEST,
  listId,
});

const fetchAccountListsSuccess = (listId: string, lists: Array<List>) => ({
  type: LIST_ADDER_LISTS_FETCH_SUCCESS,
  listId,
  lists,
});

const fetchAccountListsFail = (listId: string, err: unknown) => ({
  type: LIST_ADDER_LISTS_FETCH_FAIL,
  listId,
  err,
});

const addToListAdder = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(addToList(listId, getState().listAdder.accountId!));
};

const removeFromListAdder = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(removeFromList(listId, getState().listAdder.accountId!));
};

type ListsAction =
  | ReturnType<typeof fetchListSuccess>
  | ReturnType<typeof fetchListFail>
  | ReturnType<typeof fetchListsSuccess>
  | ListEditorSetupAction
  | ReturnType<typeof changeListEditorTitle>
  | ReturnType<typeof createListRequest>
  | ReturnType<typeof createListSuccess>
  | ReturnType<typeof createListFail>
  | ReturnType<typeof updateListRequest>
  | ReturnType<typeof updateListSuccess>
  | ReturnType<typeof updateListFail>
  | ReturnType<typeof resetListEditor>
  | ReturnType<typeof deleteListSuccess>
  | ReturnType<typeof fetchListAccountsRequest>
  | ReturnType<typeof fetchListAccountsSuccess>
  | ReturnType<typeof fetchListAccountsFail>
  | ReturnType<typeof fetchListSuggestionsReady>
  | ReturnType<typeof clearListSuggestions>
  | ReturnType<typeof changeListSuggestions>
  | ReturnType<typeof addToListSuccess>
  | ReturnType<typeof removeFromListSuccess>
  | ReturnType<typeof resetListAdder>
  | ListAdderSetupAction
  | ReturnType<typeof fetchAccountListsRequest>
  | ReturnType<typeof fetchAccountListsSuccess>
  | ReturnType<typeof fetchAccountListsFail>;

export {
  LIST_FETCH_SUCCESS,
  LIST_FETCH_FAIL,
  LISTS_FETCH_SUCCESS,
  LIST_EDITOR_TITLE_CHANGE,
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  LIST_CREATE_REQUEST,
  LIST_CREATE_SUCCESS,
  LIST_CREATE_FAIL,
  LIST_UPDATE_REQUEST,
  LIST_UPDATE_SUCCESS,
  LIST_UPDATE_FAIL,
  LIST_DELETE_SUCCESS,
  LIST_ACCOUNTS_FETCH_REQUEST,
  LIST_ACCOUNTS_FETCH_SUCCESS,
  LIST_ACCOUNTS_FETCH_FAIL,
  LIST_EDITOR_SUGGESTIONS_CHANGE,
  LIST_EDITOR_SUGGESTIONS_READY,
  LIST_EDITOR_SUGGESTIONS_CLEAR,
  LIST_EDITOR_ADD_SUCCESS,
  LIST_EDITOR_REMOVE_SUCCESS,
  LIST_ADDER_RESET,
  LIST_ADDER_SETUP,
  LIST_ADDER_LISTS_FETCH_REQUEST,
  LIST_ADDER_LISTS_FETCH_SUCCESS,
  LIST_ADDER_LISTS_FETCH_FAIL,
  fetchList,
  fetchLists,
  submitListEditor,
  setupListEditor,
  changeListEditorTitle,
  resetListEditor,
  deleteList,
  fetchListSuggestions,
  clearListSuggestions,
  changeListSuggestions,
  addToListEditor,
  removeFromListEditor,
  resetListAdder,
  setupListAdder,
  addToListAdder,
  removeFromListAdder,
  type ListsAction,
};
