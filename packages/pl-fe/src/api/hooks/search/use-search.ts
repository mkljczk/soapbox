import { useInfiniteQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

import type { SearchParams } from 'pl-api';
import type { PaginationParams } from 'pl-api/dist/params/common';

const useSearchAccounts = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  const searchQuery = useInfiniteQuery({
    queryKey: ['search', 'accounts', query, params],
    queryFn: ({ pageParam, signal }) => client.search.search(query!, {
      with_relationships: true,
      ...params,
      offset: pageParam ? data?.length : 0,
      type: 'accounts',
    }, { signal }).then(({ accounts }) => {
      dispatch(importEntities({ accounts }));
      return accounts.map(({ id }) => id);
    }),
    enabled: !!query?.trim(),
    initialPageParam: [''],
    getNextPageParam: (page) => page.length ? page : undefined,
    select: (data => data.pages.flat()),
  });

  const data: Array<string> | undefined = searchQuery.data;

  return searchQuery;
};

const useSearchStatuses = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useInfiniteQuery({
    queryKey: ['search', 'statuses', query, params],
    queryFn: ({ pageParam: offset, signal }) => client.search.search(query, {
      with_relationships: true,
      ...params,
      offset,
      type: 'statuses',
    }, { signal }).then(({ statuses }) => {
      dispatch(importEntities({ statuses }));
      return statuses.map(({ id }) => id);
    }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data => data.pages.flat()),
  });
};

const useSearchHashtags = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: ['search', 'hashtags', query, params],
    queryFn: ({ pageParam: offset, signal }) => client.search.search(query, {
      ...params,
      offset,
      type: 'hashtags',
    }, { signal }).then(({ hashtags }) => hashtags),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data => data.pages.flat()),
  });
};

const useSearchGroups = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useInfiniteQuery({
    queryKey: ['search', 'groups', query, params],
    queryFn: ({ pageParam: offset, signal }) => client.search.search(query, {
      ...params,
      offset,
      type: 'groups',
    }, { signal }).then(({ groups }) => {
      dispatch(importEntities({ groups }));
      return groups.map(({ id }) => id);
    }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data => data.pages.flat()),
  });
};

export { useSearchAccounts, useSearchStatuses, useSearchHashtags, useSearchGroups };
