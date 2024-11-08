import { Entities } from 'pl-fe/entity-store/entities';
import { selectEntity } from 'pl-fe/entity-store/selectors';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import { useBookmarkFolders } from './use-bookmark-folders';

import type{ BookmarkFolder } from 'pl-api';

const useBookmarkFolder = (folderId?: string) => {
  const {
    isError,
    isFetched,
    isFetching,
    isLoading,
    invalidate,
  } = useBookmarkFolders();

  const bookmarkFolder = useAppSelector(state => folderId
    ? selectEntity<BookmarkFolder>(state, Entities.BOOKMARK_FOLDERS, folderId)
    : undefined);

  return {
    bookmarkFolder,
    isError,
    isFetched,
    isFetching,
    isLoading,
    invalidate,
  };
};

export { useBookmarkFolder };
