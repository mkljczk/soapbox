import { useInfiniteQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { importEntities } from 'pl-hooks/importer';

const useDirectory = (order: 'active' | 'new', local: boolean = false) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  const directoryQuery = useInfiniteQuery({
    queryKey: ['accountsLists', 'directory', order, local],
    queryFn: ({ pageParam }) => client.instance.profileDirectory({
      order,
      local,
      offset: pageParam ? data?.length : 0,
    }).then((accounts) => {
      importEntities({ accounts });
      return accounts.map(({ id }) => id);
    }),
    initialPageParam: [''],
    getNextPageParam: (page) => page.length ? page : undefined,
  }, queryClient);

  const data: Array<string> | undefined = directoryQuery.data?.pages.flat();

  return {
    ...directoryQuery,
    data,
  };
};

export { useDirectory };
