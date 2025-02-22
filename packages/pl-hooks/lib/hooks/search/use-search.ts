import { useInfiniteQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { importEntities } from 'pl-hooks/importer';

import type { SearchParams, Tag } from 'pl-api';
import type { PaginationParams } from 'pl-api/dist/params/common';

const useSearchAccounts = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useInfiniteQuery({
    queryKey: ['search', 'accounts', query, params],
    queryFn: ({ pageParam: offset, signal }) => client.search.search(query!, {
      ...params,
      offset,
      type: 'accounts',
    }, { signal }).then(({ accounts }) => {
      importEntities({ accounts });
      return accounts.map(({ id }) => id);
    }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data) => data.pages.flat(),
  }, queryClient);
};

const useSearchStatuses = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useInfiniteQuery({
    queryKey: ['search', 'statuses', query, params],
    queryFn: ({ pageParam: offset, signal }) => client.search.search(query, {
      ...params,
      offset,
      type: 'statuses',
    }, { signal }).then(({ statuses }) => {
      importEntities({ statuses });
      return statuses.map(({ id }) => id);
    }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data) => data.pages.flat(),
  }, queryClient);
};

const useSearchHashtags = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useInfiniteQuery({
    queryKey: ['search', 'hashtags', query, params],
    queryFn: ({ pageParam: offset, signal }) => client.search.search(query, {
      ...params,
      offset,
      type: 'hashtags',
    }, { signal }).then(({ hashtags }) => hashtags as Array<Tag>),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data) => data.pages.flat(),
  }, queryClient);
};

export { useSearchAccounts, useSearchStatuses, useSearchHashtags };
