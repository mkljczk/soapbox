import { create } from 'mutative';

import {
  BOOKMARKED_STATUSES_FETCH_REQUEST,
  BOOKMARKED_STATUSES_FETCH_SUCCESS,
  BOOKMARKED_STATUSES_FETCH_FAIL,
  BOOKMARKED_STATUSES_EXPAND_REQUEST,
  BOOKMARKED_STATUSES_EXPAND_SUCCESS,
  BOOKMARKED_STATUSES_EXPAND_FAIL,
  type BookmarksAction,
} from 'pl-fe/actions/bookmarks';
import {
  RECENT_EVENTS_FETCH_REQUEST,
  RECENT_EVENTS_FETCH_SUCCESS,
  RECENT_EVENTS_FETCH_FAIL,
  JOINED_EVENTS_FETCH_REQUEST,
  JOINED_EVENTS_FETCH_SUCCESS,
  JOINED_EVENTS_FETCH_FAIL,
  type EventsAction,
} from 'pl-fe/actions/events';
import {
  FAVOURITED_STATUSES_FETCH_REQUEST,
  FAVOURITED_STATUSES_FETCH_SUCCESS,
  FAVOURITED_STATUSES_FETCH_FAIL,
  FAVOURITED_STATUSES_EXPAND_REQUEST,
  FAVOURITED_STATUSES_EXPAND_SUCCESS,
  FAVOURITED_STATUSES_EXPAND_FAIL,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL,
  type FavouritesAction,
} from 'pl-fe/actions/favourites';
import {
  FAVOURITE_SUCCESS,
  UNFAVOURITE_SUCCESS,
  BOOKMARK_SUCCESS,
  UNBOOKMARK_SUCCESS,
  PIN_SUCCESS,
  UNPIN_SUCCESS,
  type InteractionsAction,
} from 'pl-fe/actions/interactions';
import { PINNED_STATUSES_FETCH_SUCCESS, type PinStatusesAction } from 'pl-fe/actions/pin-statuses';
import {
  SCHEDULED_STATUSES_FETCH_REQUEST,
  SCHEDULED_STATUSES_FETCH_SUCCESS,
  SCHEDULED_STATUSES_FETCH_FAIL,
  SCHEDULED_STATUSES_EXPAND_REQUEST,
  SCHEDULED_STATUSES_EXPAND_SUCCESS,
  SCHEDULED_STATUSES_EXPAND_FAIL,
  SCHEDULED_STATUS_CANCEL_REQUEST,
  SCHEDULED_STATUS_CANCEL_SUCCESS,
  type ScheduledStatusesAction,
} from 'pl-fe/actions/scheduled-statuses';
import {
  STATUS_QUOTES_EXPAND_FAIL,
  STATUS_QUOTES_EXPAND_REQUEST,
  STATUS_QUOTES_EXPAND_SUCCESS,
  STATUS_QUOTES_FETCH_FAIL,
  STATUS_QUOTES_FETCH_REQUEST,
  STATUS_QUOTES_FETCH_SUCCESS,
  type StatusQuotesAction,
} from 'pl-fe/actions/status-quotes';
import { STATUS_CREATE_SUCCESS, type StatusesAction } from 'pl-fe/actions/statuses';

import type { PaginatedResponse, ScheduledStatus, Status } from 'pl-api';

interface StatusList {
  next: (() => Promise<PaginatedResponse<Status>>) | null;
  loaded: boolean;
  isLoading: boolean | null;
  items: Array<string>;
}

const newStatusList = (): StatusList => ({
  next: null,
  loaded: false,
  isLoading: null,
  items: [],
});

type State = Record<string, StatusList>;

const initialState: State = {
  favourites: newStatusList(),
  bookmarks: newStatusList(),
  pins: newStatusList(),
  scheduled_statuses: newStatusList(),
  recent_events: newStatusList(),
  joined_events: newStatusList(),
};

const getStatusId = (status: string | Pick<Status, 'id'>) => typeof status === 'string' ? status : status.id;

const getStatusIds = (statuses: Array<string | Pick<Status, 'id'>> = []) => statuses.map(getStatusId);

const setLoading = (state: State, listType: string, loading: boolean) => {
  const list = state[listType] = state[listType] || newStatusList();
  list.isLoading = loading;
};

const normalizeList = (state: State, listType: string, statuses: Array<string | Pick<Status, 'id'>>, next: (() => Promise<PaginatedResponse<Status>>) | null) => {
  const list = state[listType] = state[listType] || newStatusList();

  list.next = next;
  list.loaded = true;
  list.isLoading = false;
  list.items = getStatusIds(statuses);
};

const appendToList = (state: State, listType: string, statuses: Array<string | Pick<Status, 'id'>>, next: (() => Promise<PaginatedResponse<Status>>) | null) => {
  const newIds = getStatusIds(statuses);

  const list = state[listType] = state[listType] || newStatusList();

  list.next = next;
  list.isLoading = false;
  list.items = [...new Set([...list.items, ...newIds])];
};

const prependOneToList = (state: State, listType: string, status: string | Pick<Status, 'id'>) => {
  const statusId = getStatusId(status);
  const list = state[listType] = state[listType] || newStatusList();

  list.items = [...new Set([statusId, ...list.items])];
};

const removeOneFromList = (state: State, listType: string, status: string | Pick<Status, 'id'>) => {
  const statusId = getStatusId(status);
  const list = state[listType] = state[listType] || newStatusList();

  list.items = list.items.filter(id => id !== statusId);
};

const maybeAppendScheduledStatus = (state: State, status: Pick<ScheduledStatus | Status, 'id' | 'scheduled_at'>) => {
  if (!status.scheduled_at) return state;
  return prependOneToList(state, 'scheduled_statuses', getStatusId(status));
};

const addBookmarkToLists = (state: State, status: Pick<Status, 'id' | 'bookmark_folder'>) => {
  prependOneToList(state, 'bookmarks', status);
  const folderId = status.bookmark_folder;
  if (folderId) {
    prependOneToList(state, `bookmarks:${folderId}`, status);
  }
};

const removeBookmarkFromLists = (state: State, status: Pick<Status, 'id' | 'bookmark_folder'>) => {
  removeOneFromList(state, 'bookmarks', status);
  const folderId = status.bookmark_folder;
  if (folderId) {
    removeOneFromList(state, `bookmarks:${folderId}`, status);
  }
};

const statusLists = (state = initialState, action: BookmarksAction | EventsAction | FavouritesAction | InteractionsAction | PinStatusesAction | ScheduledStatusesAction | StatusesAction | StatusQuotesAction): State => {
  switch (action.type) {
    case FAVOURITED_STATUSES_FETCH_REQUEST:
    case FAVOURITED_STATUSES_EXPAND_REQUEST:
      return create(state, draft => setLoading(draft, 'favourites', true));
    case FAVOURITED_STATUSES_FETCH_FAIL:
    case FAVOURITED_STATUSES_EXPAND_FAIL:
      return create(state, draft => setLoading(draft, 'favourites', false));
    case FAVOURITED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'favourites', action.statuses, action.next));
    case FAVOURITED_STATUSES_EXPAND_SUCCESS:
      return create(state, draft => appendToList(draft, 'favourites', action.statuses, action.next));
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST:
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST:
      return create(state, draft => setLoading(draft, `favourites:${action.accountId}`, true));
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL:
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL:
      return create(state, draft => setLoading(draft, `favourites:${action.accountId}`, false));
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, `favourites:${action.accountId}`, action.statuses, action.next));
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS:
      return create(state, draft => appendToList(draft, `favourites:${action.accountId}`, action.statuses, action.next));
    case BOOKMARKED_STATUSES_FETCH_REQUEST:
    case BOOKMARKED_STATUSES_EXPAND_REQUEST:
      return create(state, draft => setLoading(draft, action.folderId ? `bookmarks:${action.folderId}` : 'bookmarks', true));
    case BOOKMARKED_STATUSES_FETCH_FAIL:
    case BOOKMARKED_STATUSES_EXPAND_FAIL:
      return create(state, draft => setLoading(draft, action.folderId ? `bookmarks:${action.folderId}` : 'bookmarks', false));
    case BOOKMARKED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, action.folderId ? `bookmarks:${action.folderId}` : 'bookmarks', action.statuses, action.next));
    case BOOKMARKED_STATUSES_EXPAND_SUCCESS:
      return create(state, draft => appendToList(draft, action.folderId ? `bookmarks:${action.folderId}` : 'bookmarks', action.statuses, action.next));
    case FAVOURITE_SUCCESS:
      return create(state, draft => prependOneToList(draft, 'favourites', action.status));
    case UNFAVOURITE_SUCCESS:
      return create(state, draft => removeOneFromList(draft, 'favourites', action.status));
    case BOOKMARK_SUCCESS:
      return create(state, draft => addBookmarkToLists(draft, action.status));
    case UNBOOKMARK_SUCCESS:
      return create(state, draft => removeBookmarkFromLists(draft, action.status));
    case PINNED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'pins', action.statuses, action.next));
    case PIN_SUCCESS:
      return create(state, draft => prependOneToList(draft, 'pins', action.status));
    case UNPIN_SUCCESS:
      return create(state, draft => removeOneFromList(draft, 'pins', action.status));
    case SCHEDULED_STATUSES_FETCH_REQUEST:
    case SCHEDULED_STATUSES_EXPAND_REQUEST:
      return create(state, draft => setLoading(draft, 'scheduled_statuses', true));
    case SCHEDULED_STATUSES_FETCH_FAIL:
    case SCHEDULED_STATUSES_EXPAND_FAIL:
      return create(state, draft => setLoading(draft, 'scheduled_statuses', false));
    case SCHEDULED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'scheduled_statuses', action.statuses, action.next as any));
    case SCHEDULED_STATUSES_EXPAND_SUCCESS:
      return create(state, draft => appendToList(draft, 'scheduled_statuses', action.statuses, action.next as any));
    case SCHEDULED_STATUS_CANCEL_REQUEST:
    case SCHEDULED_STATUS_CANCEL_SUCCESS:
      return create(state, draft => removeOneFromList(draft, 'scheduled_statuses', action.statusId));
    case STATUS_QUOTES_FETCH_REQUEST:
    case STATUS_QUOTES_EXPAND_REQUEST:
      return create(state, draft => setLoading(draft, `quotes:${action.statusId}`, true));
    case STATUS_QUOTES_FETCH_FAIL:
    case STATUS_QUOTES_EXPAND_FAIL:
      return create(state, draft => setLoading(draft, `quotes:${action.statusId}`, false));
    case STATUS_QUOTES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, `quotes:${action.statusId}`, action.statuses, action.next));
    case STATUS_QUOTES_EXPAND_SUCCESS:
      return create(state, draft => appendToList(draft, `quotes:${action.statusId}`, action.statuses, action.next));
    case RECENT_EVENTS_FETCH_REQUEST:
      return create(state, draft => setLoading(draft, 'recent_events', true));
    case RECENT_EVENTS_FETCH_FAIL:
      return create(state, draft => setLoading(draft, 'recent_events', false));
    case RECENT_EVENTS_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'recent_events', action.statuses, action.next));
    case JOINED_EVENTS_FETCH_REQUEST:
      return create(state, draft => setLoading(draft, 'joined_events', true));
    case JOINED_EVENTS_FETCH_FAIL:
      return create(state, draft => setLoading(draft, 'joined_events', false));
    case JOINED_EVENTS_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'joined_events', action.statuses, action.next));
    case STATUS_CREATE_SUCCESS:
      return create(state, draft => maybeAppendScheduledStatus(draft, action.status));
    default:
      return state;
  }
};

export {
  statusLists as default,
};
