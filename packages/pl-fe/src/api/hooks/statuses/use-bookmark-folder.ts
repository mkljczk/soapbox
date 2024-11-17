import { useBookmarkFolders } from './use-bookmark-folders';

const useBookmarkFolder = (folderId?: string) => useBookmarkFolders((data) => folderId ? data.find(folder => folder.id === folderId) : undefined);

export { useBookmarkFolder };
