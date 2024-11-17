import { useMutation } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';

const useDeleteBookmarkFolder = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'delete'],
    mutationFn: (folderId: string) => client.myAccount.deleteBookmarkFolder(folderId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  });
};

export { useDeleteBookmarkFolder };
