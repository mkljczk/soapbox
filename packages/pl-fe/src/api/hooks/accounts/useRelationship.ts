import * as v from 'valibot';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntity } from 'pl-fe/entity-store/hooks/useEntity';
import { useClient } from 'pl-fe/hooks/useClient';
import { useLoggedIn } from 'pl-fe/hooks/useLoggedIn';

import type { Relationship } from 'pl-api';

interface UseRelationshipOpts {
  enabled?: boolean;
}

const useRelationship = (accountId: string | undefined, opts: UseRelationshipOpts = {}) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const { enabled = false } = opts;

  const { entity: relationship, ...result } = useEntity<Relationship>(
    [Entities.RELATIONSHIPS, accountId!],
    () => client.accounts.getRelationships([accountId!]),
    {
      enabled: enabled && isLoggedIn && !!accountId,
      schema: v.pipe(v.any(), v.transform(arr => arr[0])),
    },
  );

  return { relationship, ...result };
};

export { useRelationship };
