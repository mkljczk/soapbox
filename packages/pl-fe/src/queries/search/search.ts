import { infiniteQueryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

import type { SearchParams } from 'pl-api';
import type { PaginationParams } from 'pl-api/dist/params/common';

const searchAccountsQueryOptions = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => infiniteQueryOptions({
  queryKey: ['search', 'accounts', query, params],
  queryFn: ({ pageParam: offset, signal }) => getClient().search.search(query!, {
    with_relationships: true,
    ...params,
    offset,
    type: 'accounts',
  }, { signal }).then(({ accounts }) => {
    store.dispatch(importEntities({ accounts }));
    return accounts.map(({ id }) => id);
  }),
  enabled: !!query?.trim(),
  initialPageParam: undefined as number | undefined,
  getNextPageParam: (_, allPages) => allPages.flat().length,
  select: (data) => data.pages.flat(),
});

const searchStatusesQueryOptions = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => infiniteQueryOptions({
  queryKey: ['search', 'statuses', query, params],
  queryFn: ({ pageParam: offset, signal }) => getClient().search.search(query, {
    with_relationships: true,
    ...params,
    offset,
    type: 'statuses',
  }, { signal }).then(({ statuses }) => {
    store.dispatch(importEntities({ statuses }));
    return statuses.map(({ id }) => id);
  }),
  enabled: !!query?.trim(),
  initialPageParam: 0,
  getNextPageParam: (_, allPages) => allPages.flat().length,
  select: (data) => data.pages.flat(),
});

const searchHashtagsQueryOptions = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => infiniteQueryOptions({
  queryKey: ['search', 'hashtags', query, params],
  queryFn: ({ pageParam: offset, signal }) => getClient().search.search(query, {
    ...params,
    offset,
    type: 'hashtags',
  }, { signal }).then(({ hashtags }) => hashtags),
  enabled: !!query?.trim(),
  initialPageParam: 0,
  getNextPageParam: (_, allPages) => allPages.flat().length,
  select: (data) => data.pages.flat(),
});

const searchGroupsQueryOptions = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => infiniteQueryOptions({
  queryKey: ['search', 'groups', query, params],
  queryFn: ({ pageParam: offset, signal }) => getClient().search.search(query, {
    ...params,
    offset,
    type: 'groups',
  }, { signal }).then(({ groups }) => {
    store.dispatch(importEntities({ groups }));
    return groups.map(({ id }) => id);
  }),
  enabled: !!query?.trim(),
  initialPageParam: 0,
  getNextPageParam: (_, allPages) => allPages.flat().length,
  select: (data) => data.pages.flat(),
});

export {
  searchAccountsQueryOptions,
  searchStatusesQueryOptions,
  searchHashtagsQueryOptions,
  searchGroupsQueryOptions,
};
