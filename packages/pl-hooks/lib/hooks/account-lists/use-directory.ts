import { useInfiniteQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { importEntities } from 'pl-hooks/importer';

const useDirectory = (order: 'active' | 'new', local: boolean = false) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useInfiniteQuery({
    queryKey: ['accountsLists', 'directory', order, local],
    queryFn: ({ pageParam: offset }) => client.instance.profileDirectory({
      order,
      local,
      offset,
    }).then((accounts) => {
      importEntities({ accounts });
      return accounts.map(({ id }) => id);
    }),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
    select: (data) => data?.pages.flat(),
  }, queryClient);
};

export { useDirectory };
