import { useMutation, useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient, usePlHooksQueryClient } from 'pl-hooks/main';

import type { BookmarkFolder, CreateBookmarkFolderParams, UpdateBookmarkFolderParams } from 'pl-api';

const useBookmarkFolders = <T>(
  select?: ((data: Array<BookmarkFolder>) => T),
) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();
  const features = client.features;

  return useQuery({
    queryKey: ['bookmarkFolders'],
    queryFn: () => client.myAccount.getBookmarkFolders(),
    enabled: features.bookmarkFolders,
    select,
  }, queryClient);
};

const useBookmarkFolder = (folderId?: string) => useBookmarkFolders((data) => folderId ? data.find(folder => folder.id === folderId) : undefined);

const useCreateBookmarkFolder = () => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'create'],
    mutationFn: (params: CreateBookmarkFolderParams) => client.myAccount.createBookmarkFolder(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  }, queryClient);
};


const useDeleteBookmarkFolder = () => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'delete'],
    mutationFn: (folderId: string) => client.myAccount.deleteBookmarkFolder(folderId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  }, queryClient);
};

const useUpdateBookmarkFolder = (folderId: string) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'update', folderId],
    mutationFn: (params: UpdateBookmarkFolderParams) => client.myAccount.updateBookmarkFolder(folderId, params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  }, queryClient);
};

export {
  useBookmarkFolders,
  useBookmarkFolder,
  useCreateBookmarkFolder,
  useDeleteBookmarkFolder,
  useUpdateBookmarkFolder,
};
