import { useMutation } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';

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

export { useCreateBookmarkFolder };
