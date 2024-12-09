import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

import { queryClient } from '../client';
import { mutationOptions } from '../utils/mutation-options';

import type { BookmarkFolder } from 'pl-api';

interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

interface UpdateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const bookmarkFoldersQueryOptions = queryOptions({
  queryKey: ['bookmarkFolders'],
  queryFn: () => getClient().myAccount.getBookmarkFolders(),
  // enabled: features.bookmarkFolders,
});

const bookmarkFolderQueryOptions = (folderId?: string) => queryOptions({
  ...bookmarkFoldersQueryOptions,
  select: (data) => folderId ? data.find(folder => folder.id === folderId) : undefined,
});

const createBookmarkFolderMutationOptions = mutationOptions({
  mutationKey: ['bookmarkFolders', 'create'],
  mutationFn: (params: CreateBookmarkFolderParams) => getClient().myAccount.createBookmarkFolder(params),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
});

const deleteBookmarkFolderMutationOptions = mutationOptions({
  mutationKey: ['bookmarkFolders', 'delete'],
  mutationFn: (folderId: string) => getClient().myAccount.deleteBookmarkFolder(folderId),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
});

const updateBookmarkFolderMutationOptions = (folderId: string) => mutationOptions({
  mutationKey: ['bookmarkFolders', 'update', folderId],
  mutationFn: (params: UpdateBookmarkFolderParams) => getClient().myAccount.updateBookmarkFolder(folderId, params),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
});

export {
  bookmarkFoldersQueryOptions,
  bookmarkFolderQueryOptions,
  createBookmarkFolderMutationOptions,
  deleteBookmarkFolderMutationOptions,
  updateBookmarkFolderMutationOptions,
};
