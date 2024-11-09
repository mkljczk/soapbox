import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

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

export { useBookmarkFolders };
