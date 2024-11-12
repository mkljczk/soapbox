import { getClient } from '../api';

import { importEntities } from './importer';

import type { PaginatedResponse, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const BOOKMARKED_STATUSES_FETCH_REQUEST = 'BOOKMARKED_STATUSES_FETCH_REQUEST' as const;
const BOOKMARKED_STATUSES_FETCH_SUCCESS = 'BOOKMARKED_STATUSES_FETCH_SUCCESS' as const;
const BOOKMARKED_STATUSES_FETCH_FAIL = 'BOOKMARKED_STATUSES_FETCH_FAIL' as const;

const BOOKMARKED_STATUSES_EXPAND_REQUEST = 'BOOKMARKED_STATUSES_EXPAND_REQUEST' as const;
const BOOKMARKED_STATUSES_EXPAND_SUCCESS = 'BOOKMARKED_STATUSES_EXPAND_SUCCESS' as const;
const BOOKMARKED_STATUSES_EXPAND_FAIL = 'BOOKMARKED_STATUSES_EXPAND_FAIL' as const;

const noOp = () => new Promise(f => f(undefined));

const fetchBookmarkedStatuses = (folderId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists[folderId ? `bookmarks:${folderId}` : 'bookmarks']?.isLoading) {
      return dispatch(noOp);
    }

    dispatch(fetchBookmarkedStatusesRequest(folderId));

    return getClient(getState()).myAccount.getBookmarks({ folder_id: folderId }).then(response => {
      dispatch(importEntities({ statuses: response.items }));
      return dispatch(fetchBookmarkedStatusesSuccess(response.items, response.next, folderId));
    }).catch(error => {
      dispatch(fetchBookmarkedStatusesFail(error, folderId));
    });
  };

const fetchBookmarkedStatusesRequest = (folderId?: string) => ({
  type: BOOKMARKED_STATUSES_FETCH_REQUEST,
  folderId,
});

const fetchBookmarkedStatusesSuccess = (statuses: Array<Status>, next: (() => Promise<PaginatedResponse<Status>>) | null, folderId?: string) => ({
  type: BOOKMARKED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
  folderId,
});

const fetchBookmarkedStatusesFail = (error: unknown, folderId?: string) => ({
  type: BOOKMARKED_STATUSES_FETCH_FAIL,
  error,
  folderId,
});

const expandBookmarkedStatuses = (folderId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const list = folderId ? `bookmarks:${folderId}` : 'bookmarks';
    const next = getState().status_lists[list]?.next || null;

    if (next === null || getState().status_lists[list]?.isLoading) {
      return dispatch(noOp);
    }

    dispatch(expandBookmarkedStatusesRequest(folderId));

    return next().then(response => {
      dispatch(importEntities({ statuses: response.items }));
      return dispatch(expandBookmarkedStatusesSuccess(response.items, response.next, folderId));
    }).catch(error => {
      dispatch(expandBookmarkedStatusesFail(error, folderId));
    });
  };

const expandBookmarkedStatusesRequest = (folderId?: string) => ({
  type: BOOKMARKED_STATUSES_EXPAND_REQUEST,
  folderId,
});

const expandBookmarkedStatusesSuccess = (statuses: Array<Status>, next: (() => Promise<PaginatedResponse<Status>>) | null, folderId?: string) => ({
  type: BOOKMARKED_STATUSES_EXPAND_SUCCESS,
  statuses,
  next,
  folderId,
});

const expandBookmarkedStatusesFail = (error: unknown, folderId?: string) => ({
  type: BOOKMARKED_STATUSES_EXPAND_FAIL,
  error,
  folderId,
});

type BookmarksAction =
  ReturnType<typeof fetchBookmarkedStatusesRequest>
  | ReturnType<typeof fetchBookmarkedStatusesSuccess>
  | ReturnType<typeof fetchBookmarkedStatusesFail>
  | ReturnType<typeof expandBookmarkedStatusesRequest>
  | ReturnType<typeof expandBookmarkedStatusesSuccess>
  | ReturnType<typeof expandBookmarkedStatusesFail>;

export {
  BOOKMARKED_STATUSES_FETCH_REQUEST,
  BOOKMARKED_STATUSES_FETCH_SUCCESS,
  BOOKMARKED_STATUSES_FETCH_FAIL,
  BOOKMARKED_STATUSES_EXPAND_REQUEST,
  BOOKMARKED_STATUSES_EXPAND_SUCCESS,
  BOOKMARKED_STATUSES_EXPAND_FAIL,
  fetchBookmarkedStatuses,
  expandBookmarkedStatuses,
  type BookmarksAction,
};
