import { infiniteQueryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

import type { SearchAccountParams } from 'pl-api';

const accountSearchQueryOptions = (
  query: string,
  params?: Omit<SearchAccountParams, 'limit' | 'offset'>,
) => infiniteQueryOptions({
  queryKey: ['search', 'accountSearch', query, params],
  queryFn: ({ pageParam: offset, signal }) => getClient().accounts.searchAccounts(query, {
    ...params,
    offset,
  }, { signal }).then((accounts) => {
    store.dispatch(importEntities({ accounts }));
    return accounts.map(({ id }) => id);
  }),
  enabled: !!query?.trim(),
  initialPageParam: 0,
  getNextPageParam: (_, allPages) => allPages.flat().length,
  select: (data) => data.pages.flat(),
});

export { accountSearchQueryOptions };
