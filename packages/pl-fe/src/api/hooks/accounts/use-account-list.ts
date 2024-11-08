import { useInfiniteQuery } from '@tanstack/react-query';

import { Entities } from 'pl-fe/entity-store/entities';
import { useClient } from 'pl-fe/hooks/use-client';
import { type Account, normalizeAccount } from 'pl-fe/normalizers/account';
import { flattenPages } from 'pl-fe/utils/queries';

import { useRelationships } from './use-relationships';

import type { PaginatedResponse, Account as BaseAccount } from 'pl-api';
import type { EntityFn } from 'pl-fe/entity-store/hooks/types';

const useAccountList = (listKey: string[], entityFn: EntityFn<void>) => {
  const getAccounts = async (pageParam?: Pick<PaginatedResponse<BaseAccount>, 'next'>) => {
    const response = await (pageParam?.next ? pageParam.next() : entityFn()) as PaginatedResponse<BaseAccount>;

    return {
      ...response,
      items: response.items.map(normalizeAccount),
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: [Entities.ACCOUNTS, ...listKey],
    queryFn: ({ pageParam }) => getAccounts(pageParam),
    enabled: true,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<BaseAccount>>) | null },
    getNextPageParam: (config) => config.next ? config : undefined,
  });

  const data = flattenPages<Account>(queryInfo.data as any) || [];

  const { relationships } = useRelationships(
    listKey,
    data.map(({ id }) => id),
  );

  const accounts = data.map((account) => ({
    ...account,
    relationship: relationships[account.id],
  }));

  return { accounts, ...queryInfo };
};

const useBlocks = () => {
  const client = useClient();
  return useAccountList(['blocks'], () => client.filtering.getBlocks());
};

const useMutes = () => {
  const client = useClient();
  return useAccountList(['mutes'], () => client.filtering.getMutes());
};

const useFollowing = (accountId: string | undefined) => {
  const client = useClient();

  return useAccountList(
    [accountId!, 'following'],
    () => client.accounts.getAccountFollowing(accountId!),
  );
};

const useFollowers = (accountId: string | undefined) => {
  const client = useClient();

  return useAccountList(
    [accountId!, 'followers'],
    () => client.accounts.getAccountFollowers(accountId!),
  );
};

export {
  useBlocks,
  useMutes,
  useFollowing,
  useFollowers,
};
