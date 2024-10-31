import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { queryClient, usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { importEntities } from 'pl-hooks/importer';
import { normalizeAccount, type NormalizedAccount } from 'pl-hooks/normalizers/account';

import { useAccountRelationship } from './use-account-relationship';

import type { PlApiClient, Relationship } from 'pl-api';

interface Account extends NormalizedAccount {
  relationship: Relationship | null;
  moved: Account | null;
}

interface UseAccountOpts {
  withRelationship?: boolean;
  withScrobble?: boolean;
  withMoveTarget?: boolean;
}

type UseAccountQueryResult = Omit<UseQueryResult<NormalizedAccount>, 'data'> & { data: Account | undefined };

const useAccount = (accountId?: string, opts: UseAccountOpts = {}): UseAccountQueryResult => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  const accountQuery = useQuery({
    queryKey: ['accounts', 'entities', accountId],
    queryFn: () => client.accounts.getAccount(accountId!)
      .then(normalizeAccount),
    enabled: !!accountId,
  }, queryClient);

  const relationshipQuery = useAccountRelationship(opts.withRelationship ? accountId : undefined);

  let data: Account | undefined;

  if (accountQuery.data) {
    data = {
      ...accountQuery.data,
      relationship: relationshipQuery.data || null,
      moved: opts.withMoveTarget && queryClient.getQueryData(['accounts', 'entities', accountQuery.data?.moved_id]) as Account || null,
    };
  }

  return { ...accountQuery, data };
};

const prefetchAccount = (client: PlApiClient, accountId: string) =>
  queryClient.prefetchQuery({
    queryKey: ['accounts', 'entities', accountId],
    queryFn: () => client.accounts.getAccount(accountId!)
      .then(account => {
        importEntities({ accounts: [account] }, { withParents: false });

        return normalizeAccount(account);
      }),
  });

export { useAccount, prefetchAccount, type UseAccountOpts, type Account as UseAccountData };
