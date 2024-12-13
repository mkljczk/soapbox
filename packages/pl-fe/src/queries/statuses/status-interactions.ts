import { MutationOptions, queryOptions } from '@tanstack/react-query';
import { create } from 'mutative';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';
import { store } from 'pl-fe/store';
import { simulateEmojiReact, simulateUnEmojiReact } from 'pl-fe/utils/emoji-reacts';

import { queryClient } from '../client';
import { mutationOptions } from '../utils/mutation-options';

import { statusQueryOptions } from './status';

import type { Status as BaseStatus } from 'pl-api';
import type { Status } from 'pl-fe/normalizers/status';

const queryKey = {
  getFavouritedBy: 'statusFavourites',
  getDislikedBy: 'statusDislikes',
  getRebloggedBy: 'statusReblogs',
};

const makeStatusInteractionsQueryOptions = (method: 'getDislikedBy' | 'getFavouritedBy' | 'getRebloggedBy') => makePaginatedResponseQueryOptions(
  (statusId: string) => ['accountsLists', queryKey[method], statusId],
  (client, params) => client.statuses[method](...params).then(minifyAccountList),
);

const statusFavouritesQueryOptions = makeStatusInteractionsQueryOptions('getFavouritedBy');

const statusDislikesQueryOptions = makeStatusInteractionsQueryOptions('getDislikedBy');

const statusReblogsQueryOptions = makeStatusInteractionsQueryOptions('getRebloggedBy');

const statusReactionsQueryOptions = (statusId: string, emoji?: string) => queryOptions({
  queryKey: ['accountsLists', 'statusReactions', statusId, emoji],
  queryFn: () => store.getState().auth.client.statuses.getStatusReactions(statusId, emoji).then((reactions) => {
    store.dispatch(importEntities({ accounts: reactions.map(({ accounts }) => accounts).flat() }));

    return reactions.map(({ accounts, ...reactions }) => reactions);
  }),
  placeholderData: (previousData) => previousData?.filter(({ name }) => name === emoji),
});

const optimisticUpdateStatusMutationOptions = <T extends (string | { statusId: string })>(
  mutationOptions: MutationOptions<BaseStatus, Error, T, unknown>,
  statusUpdater?: (status: Status, params: T) => void,
  sideEffectsUpdater?: (params: T) => void,
): MutationOptions<BaseStatus, Error, T, Status> => ({
    ...mutationOptions,
    onMutate: (params) => {
      const statusId = typeof params === 'string' ? params : params.statusId;
      const oldData = queryClient.getQueryData(statusQueryOptions(statusId).queryKey);

      if (statusUpdater) {
        queryClient.setQueryData(statusQueryOptions(statusId).queryKey, (prevData) => prevData && create(prevData, (draft) => statusUpdater(draft, params)) || undefined);
      }

      return oldData;
    },
    onError: (_, params, oldData) =>
      queryClient.setQueryData(statusQueryOptions(typeof params === 'string' ? params : params.statusId).queryKey, oldData),
    onSettled: (status, _, params) => {
      store.dispatch(importEntities({ statuses: [status] }));
      if (sideEffectsUpdater) sideEffectsUpdater(params);
    },
  });

const favouriteStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: (statusId: string) => getClient().statuses.favouriteStatus(statusId),
}), (data) => {
  data.favourites_count += 1;
  data.favourited = true;
});

const unfavouriteStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: (statusId: string) => getClient().statuses.unfavouriteStatus(statusId),
}), (data) => {
  data.favourites_count = Math.min(data.favourites_count - 1, 0);
  data.favourited = false;
});

const dislikeStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: (statusId: string) => getClient().statuses.dislikeStatus(statusId),
}), (data) => {
  data.dislikes_count += 1;
  data.disliked = true;
});

const undislikeStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: (statusId: string) => getClient().statuses.undislikeStatus(statusId),
}), (data) => {
  data.dislikes_count = Math.min(data.dislikes_count - 1, 0);
  data.disliked = false;
});

const reblogStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: ({ statusId, visibility }: { statusId: string; visibility?: string }) => getClient().statuses.reblogStatus(statusId, visibility),
}), (data) => {
  data.reblogs_count += 1;
  data.reblogged = true;
});

const unreblogStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: (statusId: string) => getClient().statuses.unreblogStatus(statusId),
}), (data) => {
  data.reblogs_count = Math.min(data.reblogs_count - 1, 0);
  data.reblogged = false;
});

const createStatusReactionMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: ({ statusId, emoji }: { statusId: string; emoji: string; custom?: string }) => getClient().statuses.createStatusReaction(statusId, emoji),
}), (data, { emoji, custom: url }) => {
  data.emoji_reactions = simulateEmojiReact(data.emoji_reactions, emoji, url);

}, ({ statusId }) => {
  queryClient.invalidateQueries(statusReactionsQueryOptions(statusId));
});

const deleteStatusReactionMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: ({ statusId, emoji }: { statusId: string; emoji: string }) => getClient().statuses.deleteStatusReaction(statusId, emoji),
}), (data, { emoji }) => {
  data.emoji_reactions = simulateUnEmojiReact(data.emoji_reactions, emoji);

}, ({ statusId }) => {
  queryClient.invalidateQueries(statusReactionsQueryOptions(statusId));
});

const bookmarkStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: ({ statusId, folderId }: {statusId: string; folderId?: string}) => getClient().statuses.bookmarkStatus(statusId, folderId),
}), (data, { folderId = null }) => {
  data.bookmarked = true;
  data.bookmark_folder = folderId;
  // TODO: Add to your bookmarks list and remove from previous folders, if applicable
});

const unbookmarkStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: (statusId: string) => getClient().statuses.unreblogStatus(statusId),
}), (data) => {
  data.bookmarked = false;
  // TODO: Remove from your bookmarks list
});

const pinStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: (statusId: string) => getClient().statuses.pinStatus(statusId),
}), (data) => {
  data.pinned = true;
  // TODO: Append to timeline
});

const unpinStatusMutationOptions = optimisticUpdateStatusMutationOptions(mutationOptions({
  mutationFn: (statusId: string) => getClient().statuses.unpinStatus(statusId),
}), (data) => {
  data.pinned = false;
  // TODO: Remove from timeline
});

export {
  statusFavouritesQueryOptions,
  statusDislikesQueryOptions,
  statusReblogsQueryOptions,
  statusReactionsQueryOptions,
  favouriteStatusMutationOptions,
  unfavouriteStatusMutationOptions,
  dislikeStatusMutationOptions,
  undislikeStatusMutationOptions,
  reblogStatusMutationOptions,
  unreblogStatusMutationOptions,
  createStatusReactionMutationOptions,
  deleteStatusReactionMutationOptions,
  bookmarkStatusMutationOptions,
  unbookmarkStatusMutationOptions,
  pinStatusMutationOptions,
  unpinStatusMutationOptions,
};
