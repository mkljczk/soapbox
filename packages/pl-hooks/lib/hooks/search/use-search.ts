import { useInfiniteQuery } from '@tanstack/react-query';

import { importEntities, usePlHooksApiClient, usePlHooksQueryClient } from 'pl-hooks/main';

import type { SearchParams, Tag } from 'pl-api';
import type { PaginationParams } from 'pl-api/dist/params/common';

const useSearchAccounts = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  const searchQuery = useInfiniteQuery({
    queryKey: ['search', 'accounts', query, params],
    queryFn: ({ pageParam }) => client.search.search(query!, {
      ...params,
      offset: pageParam ? data?.length : 0,
      type: 'accounts',
    }).then(({ accounts }) => {
      importEntities({ accounts });
      return accounts.map(({ id }) => id);
    }),
    enabled: !!query?.trim(),
    initialPageParam: [''],
    getNextPageParam: (page) => page.length ? page : undefined,
  }, queryClient);

  const data: Array<string> | undefined = searchQuery.data?.pages.flat();

  return {
    ...searchQuery,
    data,
  };
};

const useSearchStatuses = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  const searchQuery = useInfiniteQuery({
    queryKey: ['search', 'statuses', query, params],
    queryFn: ({ pageParam }) => client.search.search(query, {
      ...params,
      offset: pageParam ? data?.length : 0,
      type: 'statuses',
    }).then(({ statuses }) => {
      importEntities({ statuses });
      return statuses.map(({ id }) => id);
    }),
    enabled: !!query?.trim(),
    initialPageParam: [''],
    getNextPageParam: (page) => page.length ? page : undefined,
  }, queryClient);

  const data: Array<string> | undefined = searchQuery.data?.pages.flat();

  return {
    ...searchQuery,
    data,
  };
};

const useSearchHashtags = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  const searchQuery = useInfiniteQuery({
    queryKey: ['search', 'hashtags', query, params],
    queryFn: ({ pageParam }) => client.search.search(query, {
      ...params,
      offset: pageParam ? data?.length : 0,
      type: 'hashtags',
    }).then(({ hashtags }) => hashtags as Array<Tag>),
    enabled: !!query?.trim(),
    initialPageParam: [{}],
    getNextPageParam: (page) => page.length ? page : undefined,
  }, queryClient);

  const data: Array<Tag> | undefined = searchQuery.data?.pages.flat();

  return {
    ...searchQuery,
    data,
  };
};

export { useSearchAccounts, useSearchStatuses, useSearchHashtags };
