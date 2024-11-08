import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { flattenPages } from 'pl-fe/utils/queries';

import type { Account, PaginatedResponse } from 'pl-api';

const useAccountSearch = (q: string) => {
  const client = useClient();

  const getAccountSearch = async(q: string, pageParam?: Pick<PaginatedResponse<Account>, 'next'>): Promise<PaginatedResponse<Account>> => {
    if (pageParam?.next) return pageParam.next();

    const _getAccountSearch = async (offset = 0) => {
      const response = await client.accounts.searchAccounts(q, {
        limit: 10,
        following: true,
        offset: offset,
      });

      return {
        previous: null,
        next: response.length ? () => _getAccountSearch(offset + 10) : null,
        items: response,
        partial: false,
      };
    };

    return _getAccountSearch(0);
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['search', 'accounts', q],
    queryFn: ({ pageParam }) => getAccountSearch(q, pageParam),
    placeholderData: keepPreviousData,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<Account>>) | null },
    getNextPageParam: (config) => config.next ? config : undefined,
  });

  const data = flattenPages(queryInfo.data);

  return {
    ...queryInfo,
    data,
  };
};

export { useAccountSearch as default };
