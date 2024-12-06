import { useInfiniteQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

const useDirectory = (order: 'active' | 'new', local: boolean = false) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useInfiniteQuery({
    queryKey: ['accountsLists', 'directory', order, local],
    queryFn: ({ pageParam: offset }) => client.instance.profileDirectory({
      order,
      local,
      offset,
    }).then((accounts) => {
      dispatch(importEntities({ accounts }));
      return accounts.map(({ id }) => id);
    }),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
    select: (data) => data?.pages.flat(),
  });
};

export { useDirectory };
