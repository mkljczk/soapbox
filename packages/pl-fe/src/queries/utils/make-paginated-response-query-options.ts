import { type InfiniteData, infiniteQueryOptions } from '@tanstack/react-query';

import { store } from 'pl-fe/store';

import type { PaginatedResponse, PlApiClient } from 'pl-api';

const makePaginatedResponseQueryOptions = <T1 extends Array<any>, T2, T3 = Array<T2>>(
  queryKey: (...params: T1) => Array<string | undefined>,
  queryFn: (client: PlApiClient, params: T1) => Promise<PaginatedResponse<T2>>,
  select?: (data: InfiniteData<PaginatedResponse<T2>>) => T3,
) => (...params: T1) => infiniteQueryOptions({
    queryKey: queryKey(...params),
    queryFn: ({ pageParam }) => pageParam.next?.() || queryFn(store.getState().auth.client, params),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as Awaited<ReturnType<typeof queryFn>>,
    getNextPageParam: (page) => page.next ? page : undefined,
    select: select ?? ((data) => data.pages.map(page => page.items).flat() as T3),
  });

export { makePaginatedResponseQueryOptions };
