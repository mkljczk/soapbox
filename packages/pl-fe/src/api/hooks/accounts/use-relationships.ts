import { Entities } from 'pl-fe/entity-store/entities';
import { useBatchedEntities } from 'pl-fe/entity-store/hooks/use-batched-entities';
import { useClient } from 'pl-fe/hooks/use-client';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import type { Relationship } from 'pl-api';

const useRelationships = (listKey: string[], accountIds: string[]) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const fetchRelationships = (accountIds: string[]) => client.accounts.getRelationships(accountIds);

  const { entityMap: relationships, ...result } = useBatchedEntities<Relationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    accountIds,
    fetchRelationships,
    { enabled: isLoggedIn },
  );

  return { relationships, ...result };
};

export { useRelationships };
