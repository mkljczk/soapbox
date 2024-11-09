import { useMutation } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';

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

export { useUpdateBookmarkFolder };
