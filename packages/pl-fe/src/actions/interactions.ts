import { importEntities } from 'pl-hooks';
import { defineMessages } from 'react-intl';

import { getClient } from 'pl-fe/api';
import { useModalsStore } from 'pl-fe/stores/modals';
import toast, { type IToastOptions } from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { fetchRelationships } from './accounts';

import type { Account, EmojiReaction, PaginatedResponse, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const REBLOG_REQUEST = 'REBLOG_REQUEST' as const;
const REBLOG_SUCCESS = 'REBLOG_SUCCESS' as const;
const REBLOG_FAIL = 'REBLOG_FAIL' as const;

const FAVOURITE_REQUEST = 'FAVOURITE_REQUEST' as const;
const FAVOURITE_SUCCESS = 'FAVOURITE_SUCCESS' as const;
const FAVOURITE_FAIL = 'FAVOURITE_FAIL' as const;

const DISLIKE_REQUEST = 'DISLIKE_REQUEST' as const;
const DISLIKE_SUCCESS = 'DISLIKE_SUCCESS' as const;
const DISLIKE_FAIL = 'DISLIKE_FAIL' as const;

const UNREBLOG_REQUEST = 'UNREBLOG_REQUEST' as const;
const UNREBLOG_SUCCESS = 'UNREBLOG_SUCCESS' as const;
const UNREBLOG_FAIL = 'UNREBLOG_FAIL' as const;

const UNFAVOURITE_REQUEST = 'UNFAVOURITE_REQUEST' as const;
const UNFAVOURITE_SUCCESS = 'UNFAVOURITE_SUCCESS' as const;
const UNFAVOURITE_FAIL = 'UNFAVOURITE_FAIL' as const;

const UNDISLIKE_REQUEST = 'UNDISLIKE_REQUEST' as const;
const UNDISLIKE_SUCCESS = 'UNDISLIKE_SUCCESS' as const;
const UNDISLIKE_FAIL = 'UNDISLIKE_FAIL' as const;

const REBLOGS_FETCH_REQUEST = 'REBLOGS_FETCH_REQUEST' as const;
const REBLOGS_FETCH_SUCCESS = 'REBLOGS_FETCH_SUCCESS' as const;
const REBLOGS_FETCH_FAIL = 'REBLOGS_FETCH_FAIL' as const;

const FAVOURITES_FETCH_REQUEST = 'FAVOURITES_FETCH_REQUEST' as const;
const FAVOURITES_FETCH_SUCCESS = 'FAVOURITES_FETCH_SUCCESS' as const;
const FAVOURITES_FETCH_FAIL = 'FAVOURITES_FETCH_FAIL' as const;

const DISLIKES_FETCH_REQUEST = 'DISLIKES_FETCH_REQUEST' as const;
const DISLIKES_FETCH_SUCCESS = 'DISLIKES_FETCH_SUCCESS' as const;
const DISLIKES_FETCH_FAIL = 'DISLIKES_FETCH_FAIL' as const;

const REACTIONS_FETCH_REQUEST = 'REACTIONS_FETCH_REQUEST' as const;
const REACTIONS_FETCH_SUCCESS = 'REACTIONS_FETCH_SUCCESS' as const;
const REACTIONS_FETCH_FAIL = 'REACTIONS_FETCH_FAIL' as const;

const PIN_REQUEST = 'PIN_REQUEST' as const;
const PIN_SUCCESS = 'PIN_SUCCESS' as const;
const PIN_FAIL = 'PIN_FAIL' as const;

const UNPIN_REQUEST = 'UNPIN_REQUEST' as const;
const UNPIN_SUCCESS = 'UNPIN_SUCCESS' as const;
const UNPIN_FAIL = 'UNPIN_FAIL' as const;

const BOOKMARK_REQUEST = 'BOOKMARK_REQUEST' as const;
const BOOKMARK_SUCCESS = 'BOOKMARKED_SUCCESS' as const;
const BOOKMARK_FAIL = 'BOOKMARKED_FAIL' as const;

const UNBOOKMARK_REQUEST = 'UNBOOKMARKED_REQUEST' as const;
const UNBOOKMARK_SUCCESS = 'UNBOOKMARKED_SUCCESS' as const;
const UNBOOKMARK_FAIL = 'UNBOOKMARKED_FAIL' as const;

const REMOTE_INTERACTION_REQUEST = 'REMOTE_INTERACTION_REQUEST' as const;
const REMOTE_INTERACTION_SUCCESS = 'REMOTE_INTERACTION_SUCCESS' as const;
const REMOTE_INTERACTION_FAIL = 'REMOTE_INTERACTION_FAIL' as const;

const FAVOURITES_EXPAND_SUCCESS = 'FAVOURITES_EXPAND_SUCCESS' as const;
const FAVOURITES_EXPAND_FAIL = 'FAVOURITES_EXPAND_FAIL' as const;

const REBLOGS_EXPAND_SUCCESS = 'REBLOGS_EXPAND_SUCCESS' as const;
const REBLOGS_EXPAND_FAIL = 'REBLOGS_EXPAND_FAIL' as const;

const noOp = () => new Promise(f => f(undefined));

type AccountListLink = () => Promise<PaginatedResponse<Account>>;

const messages = defineMessages({
  bookmarkAdded: { id: 'status.bookmarked', defaultMessage: 'Bookmark added.' },
  bookmarkRemoved: { id: 'status.unbookmarked', defaultMessage: 'Bookmark removed.' },
  folderChanged: { id: 'status.bookmark_folder_changed', defaultMessage: 'Changed folder' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  selectFolder: { id: 'status.bookmark.select_folder', defaultMessage: 'Select folder' },
});

const reblog = (status: Pick<Status, 'id'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return noOp();

    dispatch(reblogRequest(status.id));

    return getClient(getState()).statuses.reblogStatus(status.id).then((response) => {
      // The reblog API method returns a new status wrapped around the original. In this case we are only
      // interested in how the original is modified, hence passing it skipping the wrapper
      if (response.reblog) importEntities({ statuses: [response] });
      dispatch(reblogSuccess(response));
    }).catch(error => {
      dispatch(reblogFail(status.id, error));
    });
  };

const unreblog = (status: Pick<Status, 'id'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return noOp();

    dispatch(unreblogRequest(status.id));

    return getClient(getState()).statuses.unreblogStatus(status.id).then((response) => {
      dispatch(unreblogSuccess(response));
    }).catch(error => {
      dispatch(unreblogFail(status.id, error));
    });
  };

const toggleReblog = (status: Pick<Status, 'id' | 'reblogged'>) => {
  if (status.reblogged) {
    return unreblog(status);
  } else {
    return reblog(status);
  }
};

const reblogRequest = (statusId: string) => ({
  type: REBLOG_REQUEST,
  statusId,
});

const reblogSuccess = (status: Status) => ({
  type: REBLOG_SUCCESS,
  status,
  statusId: status.id,
});

const reblogFail = (statusId: string, error: unknown) => ({
  type: REBLOG_FAIL,
  statusId,
  error,
});

const unreblogRequest = (statusId: string) => ({
  type: UNREBLOG_REQUEST,
  statusId,
});

const unreblogSuccess = (status: Status) => ({
  type: UNREBLOG_SUCCESS,
  status,
  statusId: status.id,
});

const unreblogFail = (statusId: string, error: unknown) => ({
  type: UNREBLOG_FAIL,
  statusId,
  error,
});

const favourite = (status: Pick<Status, 'id'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return noOp();

    dispatch(favouriteRequest(status.id));

    return getClient(getState()).statuses.favouriteStatus(status.id).then((response) => {
      dispatch(favouriteSuccess(response));
    }).catch((error) => {
      dispatch(favouriteFail(status.id, error));
    });
  };

const unfavourite = (status: Pick<Status, 'id'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return noOp();

    dispatch(unfavouriteRequest(status.id));

    return getClient(getState()).statuses.unfavouriteStatus(status.id).then((response) => {
      dispatch(unfavouriteSuccess(response));
    }).catch(error => {
      dispatch(unfavouriteFail(status.id, error));
    });
  };

const toggleFavourite = (status: Pick<Status, 'id' | 'favourited'>) => {
  if (status.favourited) {
    return unfavourite(status);
  } else {
    return favourite(status);
  }
};

const favouriteRequest = (statusId: string) => ({
  type: FAVOURITE_REQUEST,
  statusId,
});

const favouriteSuccess = (status: Status) => ({
  type: FAVOURITE_SUCCESS,
  status,
  statusId: status.id,
});

const favouriteFail = (statusId: string, error: unknown) => ({
  type: FAVOURITE_FAIL,
  statusId,
  error,
});

const unfavouriteRequest = (statusId: string) => ({
  type: UNFAVOURITE_REQUEST,
  statusId,
});

const unfavouriteSuccess = (status: Status) => ({
  type: UNFAVOURITE_SUCCESS,
  status,
  statusId: status.id,
});

const unfavouriteFail = (statusId: string, error: unknown) => ({
  type: UNFAVOURITE_FAIL,
  statusId,
  error,
});

const dislike = (status: Pick<Status, 'id'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(dislikeRequest(status.id));

    return getClient(getState).statuses.dislikeStatus(status.id).then((response) => {
      dispatch(dislikeSuccess(response));
    }).catch((error) => {
      dispatch(dislikeFail(status.id, error));
    });
  };

const undislike = (status: Pick<Status, 'id'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(undislikeRequest(status.id));

    return getClient(getState).statuses.undislikeStatus(status.id).then((response) => {
      dispatch(undislikeSuccess(response));
    }).catch(error => {
      dispatch(undislikeFail(status.id, error));
    });
  };

const toggleDislike = (status: Pick<Status, 'id' | 'disliked'>) =>
  (dispatch: AppDispatch) => {
    if (status.disliked) {
      dispatch(undislike(status));
    } else {
      dispatch(dislike(status));
    }
  };

const dislikeRequest = (statusId: string) => ({
  type: DISLIKE_REQUEST,
  statusId,
});

const dislikeSuccess = (status: Status) => ({
  type: DISLIKE_SUCCESS,
  status,
  statusId: status.id,
});

const dislikeFail = (statusId: string, error: unknown) => ({
  type: DISLIKE_FAIL,
  statusId,
  error,
});

const undislikeRequest = (statusId: string) => ({
  type: UNDISLIKE_REQUEST,
  statusId,
});

const undislikeSuccess = (status: Status) => ({
  type: UNDISLIKE_SUCCESS,
  status,
  statusId: status.id,
});

const undislikeFail = (statusId: string, error: unknown) => ({
  type: UNDISLIKE_FAIL,
  statusId,
  error,
});

const bookmark = (status: Pick<Status, 'id'>, folderId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const features = state.auth.client.features;

    dispatch(bookmarkRequest(status.id));

    return getClient(getState()).statuses.bookmarkStatus(status.id, folderId).then((status) => {
      importEntities({ statuses: [status] });
      dispatch(bookmarkSuccess(status));

      let opts: IToastOptions = {
        actionLabel: messages.view,
        actionLink: folderId ? `/bookmarks/${folderId}` : '/bookmarks/all',
      };

      if (features.bookmarkFolders && typeof folderId !== 'string') {
        opts = {
          actionLabel: messages.selectFolder,
          action: () => useModalsStore.getState().openModal('SELECT_BOOKMARK_FOLDER', {
            statusId: status.id,
          }),
        };
      }

      toast.success(typeof folderId === 'string' ? messages.folderChanged : messages.bookmarkAdded, opts);
    }).catch((error) => {
      dispatch(bookmarkFail(status.id, error));
    });
  };

const unbookmark = (status: Pick<Status, 'id'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(unbookmarkRequest(status.id));

    return getClient(getState()).statuses.unbookmarkStatus(status.id).then(response => {
      importEntities({ statuses: [response] });
      dispatch(unbookmarkSuccess(response));
      toast.success(messages.bookmarkRemoved);
    }).catch(error => {
      dispatch(unbookmarkFail(status.id, error));
    });
  };

const toggleBookmark = (status: Pick<Status, 'id' | 'bookmarked'>) =>
  (dispatch: AppDispatch) => {
    if (status.bookmarked) {
      dispatch(unbookmark(status));
    } else {
      dispatch(bookmark(status));
    }
  };

const bookmarkRequest = (statusId: string) => ({
  type: BOOKMARK_REQUEST,
  statusId,
});

const bookmarkSuccess = (status: Status) => ({
  type: BOOKMARK_SUCCESS,
  status,
  statusId: status.id,
});

const bookmarkFail = (statusId: string, error: unknown) => ({
  type: BOOKMARK_FAIL,
  statusId,
  error,
});

const unbookmarkRequest = (statusId: string) => ({
  type: UNBOOKMARK_REQUEST,
  statusId,
});

const unbookmarkSuccess = (status: Status) => ({
  type: UNBOOKMARK_SUCCESS,
  status,
  statusId: status.id,
});

const unbookmarkFail = (statusId: string, error: unknown) => ({
  type: UNBOOKMARK_FAIL,
  statusId,
  error,
});

const fetchReblogs = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchReblogsRequest(statusId));

    return getClient(getState()).statuses.getRebloggedBy(statusId).then(response => {
      importEntities({ accounts: response.items });
      dispatch(fetchRelationships(response.items.map((item) => item.id)));
      dispatch(fetchReblogsSuccess(statusId, response.items, response.next));
    }).catch(error => {
      dispatch(fetchReblogsFail(statusId, error));
    });
  };

const fetchReblogsRequest = (statusId: string) => ({
  type: REBLOGS_FETCH_REQUEST,
  statusId,
});

const fetchReblogsSuccess = (statusId: string, accounts: Array<Account>, next: AccountListLink | null) => ({
  type: REBLOGS_FETCH_SUCCESS,
  statusId,
  accounts,
  next,
});

const fetchReblogsFail = (statusId: string, error: unknown) => ({
  type: REBLOGS_FETCH_FAIL,
  statusId,
  error,
});

const expandReblogs = (statusId: string, next: AccountListLink) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    next().then(response => {
      importEntities({ accounts: response.items });
      dispatch(fetchRelationships(response.items.map((item) => item.id)));
      dispatch(expandReblogsSuccess(statusId, response.items, response.next));
    }).catch(error => {
      dispatch(expandReblogsFail(statusId, error));
    });
  };

const expandReblogsSuccess = (statusId: string, accounts: Array<Account>, next: AccountListLink | null) => ({
  type: REBLOGS_EXPAND_SUCCESS,
  statusId,
  accounts,
  next,
});

const expandReblogsFail = (statusId: string, error: unknown) => ({
  type: REBLOGS_EXPAND_FAIL,
  statusId,
  error,
});

const fetchFavourites = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchFavouritesRequest(statusId));

    return getClient(getState()).statuses.getFavouritedBy(statusId).then(response => {
      importEntities({ accounts: response.items });
      dispatch(fetchRelationships(response.items.map((item) => item.id)));
      dispatch(fetchFavouritesSuccess(statusId, response.items, response.next));
    }).catch(error => {
      dispatch(fetchFavouritesFail(statusId, error));
    });
  };

const fetchFavouritesRequest = (statusId: string) => ({
  type: FAVOURITES_FETCH_REQUEST,
  statusId,
});

const fetchFavouritesSuccess = (statusId: string, accounts: Array<Account>, next: AccountListLink | null) => ({
  type: FAVOURITES_FETCH_SUCCESS,
  statusId,
  accounts,
  next,
});

const fetchFavouritesFail = (statusId: string, error: unknown) => ({
  type: FAVOURITES_FETCH_FAIL,
  statusId,
  error,
});

const expandFavourites = (statusId: string, next: AccountListLink) =>
  (dispatch: AppDispatch) => {
    next().then(response => {
      importEntities({ accounts: response.items });
      dispatch(fetchRelationships(response.items.map((item) => item.id)));
      dispatch(expandFavouritesSuccess(statusId, response.items, response.next));
    }).catch(error => {
      dispatch(expandFavouritesFail(statusId, error));
    });
  };

const expandFavouritesSuccess = (statusId: string, accounts: Array<Account>, next: AccountListLink | null) => ({
  type: FAVOURITES_EXPAND_SUCCESS,
  statusId,
  accounts,
  next,
});

const expandFavouritesFail = (statusId: string, error: unknown) => ({
  type: FAVOURITES_EXPAND_FAIL,
  statusId,
  error,
});

const fetchDislikes = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchDislikesRequest(statusId));

    return getClient(getState).statuses.getDislikedBy(statusId).then(response => {
      importEntities({ accounts: response });
      dispatch(fetchRelationships(response.map((item) => item.id)));
      dispatch(fetchDislikesSuccess(statusId, response));
    }).catch(error => {
      dispatch(fetchDislikesFail(statusId, error));
    });
  };

const fetchDislikesRequest = (statusId: string) => ({
  type: DISLIKES_FETCH_REQUEST,
  statusId,
});

const fetchDislikesSuccess = (statusId: string, accounts: Array<Account>) => ({
  type: DISLIKES_FETCH_SUCCESS,
  statusId,
  accounts,
});

const fetchDislikesFail = (statusId: string, error: unknown) => ({
  type: DISLIKES_FETCH_FAIL,
  statusId,
  error,
});

const fetchReactions = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchReactionsRequest(statusId));

    return getClient(getState).statuses.getStatusReactions(statusId).then(response => {
      importEntities({ accounts: (response).map(({ accounts }) => accounts).flat() });
      dispatch(fetchReactionsSuccess(statusId, response));
    }).catch(error => {
      dispatch(fetchReactionsFail(statusId, error));
    });
  };

const fetchReactionsRequest = (statusId: string) => ({
  type: REACTIONS_FETCH_REQUEST,
  statusId,
});

const fetchReactionsSuccess = (statusId: string, reactions: EmojiReaction[]) => ({
  type: REACTIONS_FETCH_SUCCESS,
  statusId,
  reactions,
});

const fetchReactionsFail = (statusId: string, error: unknown) => ({
  type: REACTIONS_FETCH_FAIL,
  statusId,
  error,
});

const pin = (status: Pick<Status, 'id'>, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(pinRequest(status.id, accountId));

    return getClient(getState()).statuses.pinStatus(status.id).then(response => {
      importEntities({ statuses: [response] });
      dispatch(pinSuccess(response, accountId));
    }).catch(error => {
      dispatch(pinFail(status.id, error, accountId));
    });
  };

const pinRequest = (statusId: string, accountId: string) => ({
  type: PIN_REQUEST,
  statusId,
  accountId,
});

const pinSuccess = (status: Status, accountId: string) => ({
  type: PIN_SUCCESS,
  status,
  statusId: status.id,
  accountId,
});

const pinFail = (statusId: string, error: unknown, accountId: string) => ({
  type: PIN_FAIL,
  statusId,
  error,
  accountId,
});

const unpin = (status: Pick<Status, 'id'>, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unpinRequest(status.id, accountId));

    return getClient(getState()).statuses.unpinStatus(status.id).then(response => {
      importEntities({ statuses: [response] });
      dispatch(unpinSuccess(response, accountId));
    }).catch(error => {
      dispatch(unpinFail(status.id, error, accountId));
    });
  };

const togglePin = (status: Pick<Status, 'id' | 'pinned'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const accountId = getState().me;

    if (!accountId) return;

    if (status.pinned) {
      dispatch(unpin(status, accountId));
    } else {
      dispatch(pin(status, accountId));
    }
  };

const unpinRequest = (statusId: string, accountId: string) => ({
  type: UNPIN_REQUEST,
  statusId,
  accountId,
});

const unpinSuccess = (status: Status, accountId: string) => ({
  type: UNPIN_SUCCESS,
  status,
  statusId: status.id,
  accountId,
});

const unpinFail = (statusId: string, error: unknown, accountId: string) => ({
  type: UNPIN_FAIL,
  statusId,
  error,
  accountId,
});

const remoteInteraction = (ap_id: string, profile: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(remoteInteractionRequest(ap_id, profile));

    return getClient(getState).accounts.remoteInteraction(ap_id, profile).then((data) => {
      dispatch(remoteInteractionSuccess(ap_id, profile, data.url));

      return data.url;
    }).catch(error => {
      dispatch(remoteInteractionFail(ap_id, profile, error));
      throw error;
    });
  };

const remoteInteractionRequest = (ap_id: string, profile: string) => ({
  type: REMOTE_INTERACTION_REQUEST,
  ap_id,
  profile,
});

const remoteInteractionSuccess = (ap_id: string, profile: string, url: string) => ({
  type: REMOTE_INTERACTION_SUCCESS,
  ap_id,
  profile,
  url,
});

const remoteInteractionFail = (ap_id: string, profile: string, error: unknown) => ({
  type: REMOTE_INTERACTION_FAIL,
  ap_id,
  profile,
  error,
});

type InteractionsAction =
  ReturnType<typeof reblogRequest>
  | ReturnType<typeof reblogSuccess>
  | ReturnType<typeof reblogFail>
  | ReturnType<typeof unreblogRequest>
  | ReturnType<typeof unreblogSuccess>
  | ReturnType<typeof unreblogFail>
  | ReturnType<typeof favouriteRequest>
  | ReturnType<typeof favouriteSuccess>
  | ReturnType<typeof favouriteFail>
  | ReturnType<typeof unfavouriteRequest>
  | ReturnType<typeof unfavouriteSuccess>
  | ReturnType<typeof unfavouriteFail>
  | ReturnType<typeof dislikeRequest>
  | ReturnType<typeof dislikeSuccess>
  | ReturnType<typeof dislikeFail>
  | ReturnType<typeof undislikeRequest>
  | ReturnType<typeof undislikeSuccess>
  | ReturnType<typeof undislikeFail>
  | ReturnType<typeof bookmarkRequest>
  | ReturnType<typeof bookmarkSuccess>
  | ReturnType<typeof bookmarkFail>
  | ReturnType<typeof unbookmarkRequest>
  | ReturnType<typeof unbookmarkSuccess>
  | ReturnType<typeof unbookmarkFail>
  | ReturnType<typeof fetchReblogsRequest>
  | ReturnType<typeof fetchReblogsSuccess>
  | ReturnType<typeof fetchReblogsFail>
  | ReturnType<typeof fetchFavouritesRequest>
  | ReturnType<typeof fetchFavouritesSuccess>
  | ReturnType<typeof fetchFavouritesFail>
  | ReturnType<typeof fetchDislikesRequest>
  | ReturnType<typeof fetchDislikesSuccess>
  | ReturnType<typeof fetchDislikesFail>
  | ReturnType<typeof fetchReactionsRequest>
  | ReturnType<typeof fetchReactionsSuccess>
  | ReturnType<typeof fetchReactionsFail>
  | ReturnType<typeof pinRequest>
  | ReturnType<typeof pinSuccess>
  | ReturnType<typeof pinFail>
  | ReturnType<typeof unpinRequest>
  | ReturnType<typeof unpinSuccess>
  | ReturnType<typeof unpinFail>
  | ReturnType<typeof remoteInteractionRequest>
  | ReturnType<typeof remoteInteractionSuccess>
  | ReturnType<typeof remoteInteractionFail>;

export {
  REBLOG_REQUEST,
  REBLOG_SUCCESS,
  REBLOG_FAIL,
  FAVOURITE_REQUEST,
  FAVOURITE_SUCCESS,
  FAVOURITE_FAIL,
  DISLIKE_REQUEST,
  DISLIKE_SUCCESS,
  DISLIKE_FAIL,
  UNREBLOG_REQUEST,
  UNREBLOG_SUCCESS,
  UNREBLOG_FAIL,
  UNFAVOURITE_REQUEST,
  UNFAVOURITE_SUCCESS,
  UNFAVOURITE_FAIL,
  UNDISLIKE_REQUEST,
  UNDISLIKE_SUCCESS,
  UNDISLIKE_FAIL,
  REBLOGS_FETCH_REQUEST,
  REBLOGS_FETCH_SUCCESS,
  REBLOGS_FETCH_FAIL,
  FAVOURITES_FETCH_REQUEST,
  FAVOURITES_FETCH_SUCCESS,
  FAVOURITES_FETCH_FAIL,
  DISLIKES_FETCH_REQUEST,
  DISLIKES_FETCH_SUCCESS,
  DISLIKES_FETCH_FAIL,
  REACTIONS_FETCH_REQUEST,
  REACTIONS_FETCH_SUCCESS,
  REACTIONS_FETCH_FAIL,
  PIN_REQUEST,
  PIN_SUCCESS,
  PIN_FAIL,
  UNPIN_REQUEST,
  UNPIN_SUCCESS,
  UNPIN_FAIL,
  BOOKMARK_REQUEST,
  BOOKMARK_SUCCESS,
  BOOKMARK_FAIL,
  UNBOOKMARK_REQUEST,
  UNBOOKMARK_SUCCESS,
  UNBOOKMARK_FAIL,
  REMOTE_INTERACTION_REQUEST,
  REMOTE_INTERACTION_SUCCESS,
  REMOTE_INTERACTION_FAIL,
  FAVOURITES_EXPAND_SUCCESS,
  FAVOURITES_EXPAND_FAIL,
  REBLOGS_EXPAND_SUCCESS,
  REBLOGS_EXPAND_FAIL,
  reblog,
  unreblog,
  toggleReblog,
  reblogRequest,
  reblogSuccess,
  reblogFail,
  unreblogRequest,
  unreblogSuccess,
  unreblogFail,
  favourite,
  unfavourite,
  toggleFavourite,
  favouriteRequest,
  favouriteSuccess,
  favouriteFail,
  unfavouriteRequest,
  unfavouriteSuccess,
  unfavouriteFail,
  dislike,
  undislike,
  toggleDislike,
  dislikeRequest,
  dislikeSuccess,
  dislikeFail,
  undislikeRequest,
  undislikeSuccess,
  undislikeFail,
  bookmark,
  unbookmark,
  toggleBookmark,
  bookmarkRequest,
  bookmarkSuccess,
  bookmarkFail,
  unbookmarkRequest,
  unbookmarkSuccess,
  unbookmarkFail,
  fetchReblogs,
  fetchReblogsRequest,
  fetchReblogsSuccess,
  fetchReblogsFail,
  expandReblogs,
  fetchFavourites,
  fetchFavouritesRequest,
  fetchFavouritesSuccess,
  fetchFavouritesFail,
  expandFavourites,
  fetchDislikes,
  fetchDislikesRequest,
  fetchDislikesSuccess,
  fetchDislikesFail,
  fetchReactions,
  fetchReactionsRequest,
  fetchReactionsSuccess,
  fetchReactionsFail,
  pin,
  pinRequest,
  pinSuccess,
  pinFail,
  unpin,
  unpinRequest,
  unpinSuccess,
  unpinFail,
  togglePin,
  remoteInteraction,
  remoteInteractionRequest,
  remoteInteractionSuccess,
  remoteInteractionFail,
  type InteractionsAction,
};
