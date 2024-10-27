import {
  Map as ImmutableMap,
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
} from 'immutable';

import {
  STATUS_QUOTES_EXPAND_FAIL,
  STATUS_QUOTES_EXPAND_REQUEST,
  STATUS_QUOTES_EXPAND_SUCCESS,
  STATUS_QUOTES_FETCH_FAIL,
  STATUS_QUOTES_FETCH_REQUEST,
  STATUS_QUOTES_FETCH_SUCCESS,
  type StatusQuotesAction,
} from 'pl-fe/actions/status-quotes';
import { STATUS_CREATE_SUCCESS } from 'pl-fe/actions/statuses';

import {
  BOOKMARKED_STATUSES_FETCH_REQUEST,
  BOOKMARKED_STATUSES_FETCH_SUCCESS,
  BOOKMARKED_STATUSES_FETCH_FAIL,
  BOOKMARKED_STATUSES_EXPAND_REQUEST,
  BOOKMARKED_STATUSES_EXPAND_SUCCESS,
  BOOKMARKED_STATUSES_EXPAND_FAIL,
  type BookmarksAction,
} from '../actions/bookmarks';
import {
  RECENT_EVENTS_FETCH_REQUEST,
  RECENT_EVENTS_FETCH_SUCCESS,
  RECENT_EVENTS_FETCH_FAIL,
  JOINED_EVENTS_FETCH_REQUEST,
  JOINED_EVENTS_FETCH_SUCCESS,
  JOINED_EVENTS_FETCH_FAIL,
  type EventsAction,
} from '../actions/events';
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
} from '../actions/favourites';
import {
  FAVOURITE_SUCCESS,
  UNFAVOURITE_SUCCESS,
  BOOKMARK_SUCCESS,
  UNBOOKMARK_SUCCESS,
  PIN_SUCCESS,
  UNPIN_SUCCESS,
  type InteractionsAction,
} from '../actions/interactions';
import { PINNED_STATUSES_FETCH_SUCCESS, type PinStatusesAction } from '../actions/pin-statuses';
import {
  SCHEDULED_STATUSES_FETCH_REQUEST,
  SCHEDULED_STATUSES_FETCH_SUCCESS,
  SCHEDULED_STATUSES_FETCH_FAIL,
  SCHEDULED_STATUSES_EXPAND_REQUEST,
  SCHEDULED_STATUSES_EXPAND_SUCCESS,
  SCHEDULED_STATUSES_EXPAND_FAIL,
  SCHEDULED_STATUS_CANCEL_REQUEST,
  SCHEDULED_STATUS_CANCEL_SUCCESS,
} from '../actions/scheduled-statuses';

import type { PaginatedResponse, ScheduledStatus, Status } from 'pl-api';
import type { AnyAction } from 'redux';

const StatusListRecord = ImmutableRecord({
  next: null as (() => Promise<PaginatedResponse<Status>>) | null,
  loaded: false,
  isLoading: null as boolean | null,
  items: ImmutableOrderedSet<string>(),
});

type State = ImmutableMap<string, StatusList>;
type StatusList = ReturnType<typeof StatusListRecord>;

const initialState: State = ImmutableMap({
  favourites: StatusListRecord(),
  bookmarks: StatusListRecord(),
  pins: StatusListRecord(),
  scheduled_statuses: StatusListRecord(),
  recent_events: StatusListRecord(),
  joined_events: StatusListRecord(),
});

const getStatusId = (status: string | Pick<Status, 'id'>) => typeof status === 'string' ? status : status.id;

const getStatusIds = (statuses: Array<string | Pick<Status, 'id'>> = []) => (
  ImmutableOrderedSet(statuses.map(getStatusId))
);

const setLoading = (state: State, listType: string, loading: boolean) =>
  state.update(listType, StatusListRecord(), listMap => listMap.set('isLoading', loading));

const normalizeList = (state: State, listType: string, statuses: Array<string | Pick<Status, 'id'>>, next: (() => Promise<PaginatedResponse<Status>>) | null) =>
  state.update(listType, StatusListRecord(), listMap => listMap.withMutations(map => {
    map.set('next', next);
    map.set('loaded', true);
    map.set('isLoading', false);
    map.set('items', getStatusIds(statuses));
  }));

const appendToList = (state: State, listType: string, statuses: Array<string | Pick<Status, 'id'>>, next: (() => Promise<PaginatedResponse<Status>>) | null) => {
  const newIds = getStatusIds(statuses);

  return state.update(listType, StatusListRecord(), listMap => listMap.withMutations(map => {
    map.set('next', next);
    map.set('isLoading', false);
    map.update('items', items => items.union(newIds));
  }));
};

const prependOneToList = (state: State, listType: string, status: string | Pick<Status, 'id'>) => {
  const statusId = getStatusId(status);
  return state.update(listType, StatusListRecord(), listMap => listMap.update('items', items =>
    ImmutableOrderedSet([statusId]).union(items as ImmutableOrderedSet<string>),
  ));
};

const removeOneFromList = (state: State, listType: string, status: string | Pick<Status, 'id'>) => {
  const statusId = getStatusId(status);
  return state.update(listType, StatusListRecord(), listMap => listMap.update('items', items => items.delete(statusId)));
};

const maybeAppendScheduledStatus = (state: State, status: Pick<ScheduledStatus | Status, 'id' | 'scheduled_at'>) => {
  if (!status.scheduled_at) return state;
  return prependOneToList(state, 'scheduled_statuses', getStatusId(status));
};

const addBookmarkToLists = (state: State, status: Pick<Status, 'id' | 'bookmark_folder'>) => {
  state = prependOneToList(state, 'bookmarks', status);
  const folderId = status.bookmark_folder;
  if (folderId) {
    return prependOneToList(state, `bookmarks:${folderId}`, status);
  }
  return state;
};

const removeBookmarkFromLists = (state: State, status: Pick<Status, 'id' | 'bookmark_folder'>) => {
  state = removeOneFromList(state, 'bookmarks', status);
  const folderId = status.bookmark_folder;
  if (folderId) {
    return removeOneFromList(state, `bookmarks:${folderId}`, status);
  }
  return state;
};

const statusLists = (state = initialState, action: AnyAction | BookmarksAction | EventsAction | FavouritesAction | InteractionsAction | PinStatusesAction | StatusQuotesAction) => {
  switch (action.type) {
    case FAVOURITED_STATUSES_FETCH_REQUEST:
    case FAVOURITED_STATUSES_EXPAND_REQUEST:
      return setLoading(state, 'favourites', true);
    case FAVOURITED_STATUSES_FETCH_FAIL:
    case FAVOURITED_STATUSES_EXPAND_FAIL:
      return setLoading(state, 'favourites', false);
    case FAVOURITED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, 'favourites', action.statuses, action.next);
    case FAVOURITED_STATUSES_EXPAND_SUCCESS:
      return appendToList(state, 'favourites', action.statuses, action.next);
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST:
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST:
      return setLoading(state, `favourites:${action.accountId}`, true);
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL:
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL:
      return setLoading(state, `favourites:${action.accountId}`, false);
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, `favourites:${action.accountId}`, action.statuses, action.next);
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS:
      return appendToList(state, `favourites:${action.accountId}`, action.statuses, action.next);
    case BOOKMARKED_STATUSES_FETCH_REQUEST:
    case BOOKMARKED_STATUSES_EXPAND_REQUEST:
      return setLoading(state, action.folderId ? `bookmarks:${action.folderId}` : 'bookmarks', true);
    case BOOKMARKED_STATUSES_FETCH_FAIL:
    case BOOKMARKED_STATUSES_EXPAND_FAIL:
      return setLoading(state, action.folderId ? `bookmarks:${action.folderId}` : 'bookmarks', false);
    case BOOKMARKED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, action.folderId ? `bookmarks:${action.folderId}` : 'bookmarks', action.statuses, action.next);
    case BOOKMARKED_STATUSES_EXPAND_SUCCESS:
      return appendToList(state, action.folderId ? `bookmarks:${action.folderId}` : 'bookmarks', action.statuses, action.next);
    case FAVOURITE_SUCCESS:
      return prependOneToList(state, 'favourites', action.status);
    case UNFAVOURITE_SUCCESS:
      return removeOneFromList(state, 'favourites', action.status);
    case BOOKMARK_SUCCESS:
      return addBookmarkToLists(state, action.status);
    case UNBOOKMARK_SUCCESS:
      return removeBookmarkFromLists(state, action.status);
    case PINNED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, 'pins', action.statuses, action.next);
    case PIN_SUCCESS:
      return prependOneToList(state, 'pins', action.status);
    case UNPIN_SUCCESS:
      return removeOneFromList(state, 'pins', action.status);
    case SCHEDULED_STATUSES_FETCH_REQUEST:
    case SCHEDULED_STATUSES_EXPAND_REQUEST:
      return setLoading(state, 'scheduled_statuses', true);
    case SCHEDULED_STATUSES_FETCH_FAIL:
    case SCHEDULED_STATUSES_EXPAND_FAIL:
      return setLoading(state, 'scheduled_statuses', false);
    case SCHEDULED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, 'scheduled_statuses', action.statuses, action.next);
    case SCHEDULED_STATUSES_EXPAND_SUCCESS:
      return appendToList(state, 'scheduled_statuses', action.statuses, action.next);
    case SCHEDULED_STATUS_CANCEL_REQUEST:
    case SCHEDULED_STATUS_CANCEL_SUCCESS:
      return removeOneFromList(state, 'scheduled_statuses', action.statusId);
    case STATUS_QUOTES_FETCH_REQUEST:
    case STATUS_QUOTES_EXPAND_REQUEST:
      return setLoading(state, `quotes:${action.statusId}`, true);
    case STATUS_QUOTES_FETCH_FAIL:
    case STATUS_QUOTES_EXPAND_FAIL:
      return setLoading(state, `quotes:${action.statusId}`, false);
    case STATUS_QUOTES_FETCH_SUCCESS:
      return normalizeList(state, `quotes:${action.statusId}`, action.statuses, action.next);
    case STATUS_QUOTES_EXPAND_SUCCESS:
      return appendToList(state, `quotes:${action.statusId}`, action.statuses, action.next);
    case RECENT_EVENTS_FETCH_REQUEST:
      return setLoading(state, 'recent_events', true);
    case RECENT_EVENTS_FETCH_FAIL:
      return setLoading(state, 'recent_events', false);
    case RECENT_EVENTS_FETCH_SUCCESS:
      return normalizeList(state, 'recent_events', action.statuses, action.next);
    case JOINED_EVENTS_FETCH_REQUEST:
      return setLoading(state, 'joined_events', true);
    case JOINED_EVENTS_FETCH_FAIL:
      return setLoading(state, 'joined_events', false);
    case JOINED_EVENTS_FETCH_SUCCESS:
      return normalizeList(state, 'joined_events', action.statuses, action.next);
    case STATUS_CREATE_SUCCESS:
      return maybeAppendScheduledStatus(state, action.status);
    default:
      return state;
  }
};

export {
  StatusListRecord,
  statusLists as default,
};
