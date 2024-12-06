import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

import { queryClient } from '../client';

import type { BookmarkFolder } from 'pl-api';

const useBookmarkFolders = <T>(
  select?: ((data: Array<BookmarkFolder>) => T),
) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['bookmarkFolders'],
    queryFn: () => client.myAccount.getBookmarkFolders(),
    enabled: features.bookmarkFolders,
    select,
  });
};

const useBookmarkFolder = (folderId?: string) => useBookmarkFolders((data) => folderId ? data.find(folder => folder.id === folderId) : undefined);

interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useCreateBookmarkFolder = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'create'],
    mutationFn: (params: CreateBookmarkFolderParams) => client.myAccount.createBookmarkFolder(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  });
};

const useDeleteBookmarkFolder = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'delete'],
    mutationFn: (folderId: string) => client.myAccount.deleteBookmarkFolder(folderId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  });
};

interface UpdateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useUpdateBookmarkFolder = (folderId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'update', folderId],
    mutationFn: (params: UpdateBookmarkFolderParams) => client.myAccount.updateBookmarkFolder(folderId, params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  });
};

export { useBookmarkFolders, useBookmarkFolder, useCreateBookmarkFolder, useDeleteBookmarkFolder, useUpdateBookmarkFolder };
