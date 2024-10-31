import { GroupRoles } from 'pl-api';

import { Entities } from 'pl-fe/entity-store/entities';
import { useDismissEntity  } from 'pl-fe/entity-store/hooks/use-dismiss-entity';
import { useEntities } from 'pl-fe/entity-store/hooks/use-entities';
import { useClient } from 'pl-fe/hooks/use-client';
import { normalizeAccount } from 'pl-fe/normalizers/account';

import { useGroupRelationship } from './use-group-relationship';

import type { ExpandedEntitiesPath } from 'pl-fe/entity-store/hooks/types';

const useGroupMembershipRequests = (groupId: string) => {
  const client = useClient();
  const path: ExpandedEntitiesPath = [Entities.ACCOUNTS, 'membership_requests', groupId];

  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  const { entities, invalidate, fetchEntities, ...rest } = useEntities(
    path,
    () => client.experimental.groups.getGroupMembershipRequests(groupId),
    {
      transform: normalizeAccount,
      enabled: relationship?.role === GroupRoles.OWNER || relationship?.role === GroupRoles.ADMIN,
    },
  );

  const { dismissEntity: authorize } = useDismissEntity(path, async (accountId: string) => {
    const response = await client.experimental.groups.acceptGroupMembershipRequest(groupId, accountId);
    invalidate();
    return response;
  });

  const { dismissEntity: reject } = useDismissEntity(path, async (accountId: string) => {
    const response = await client.experimental.groups.rejectGroupMembershipRequest(groupId, accountId);
    invalidate();
    return response;
  });

  return {
    accounts: entities,
    refetch: fetchEntities,
    authorize,
    reject,
    ...rest,
  };
};

export { useGroupMembershipRequests };
