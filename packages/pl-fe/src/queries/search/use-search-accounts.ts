import { useInfiniteQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

import type { SearchAccountParams } from 'pl-api';

const useAccountSearch = (
  query: string,
  params?: Omit<SearchAccountParams, 'limit' | 'offset'>,
) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useInfiniteQuery({
    queryKey: ['search', 'accountSearch', query, params],
    queryFn: ({ pageParam: offset, signal }) => client.accounts.searchAccounts(query, {
      ...params,
      offset,
    }, { signal }).then((accounts) => {
      dispatch(importEntities({ accounts }));
      return accounts.map(({ id }) => id);
    }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data) => data.pages.flat(),
  });
};

export { useAccountSearch };
