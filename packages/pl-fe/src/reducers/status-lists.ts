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
import { PINNED_STATUSES_FETCH_SUCCESS, type PinStatusesAction } from 'pl-fe/actions/pin-statuses';

import type { PaginatedResponse, Status } from 'pl-api';

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

const statusLists = (state = initialState, action: BookmarksAction | EventsAction | FavouritesAction | PinStatusesAction): State => {
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
    case PINNED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'pins', action.statuses, action.next));
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
    default:
      return state;
  }
};

export {
  statusLists as default,
};
