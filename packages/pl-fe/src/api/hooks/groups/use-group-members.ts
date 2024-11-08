import { Entities } from 'pl-fe/entity-store/entities';
import { useEntities } from 'pl-fe/entity-store/hooks/use-entities';
import { useClient } from 'pl-fe/hooks/use-client';
import { normalizeGroupMember, type GroupMember } from 'pl-fe/normalizers/group-member';

import type { GroupMember as BaseGroupMember, GroupRoles } from 'pl-api';

const useGroupMembers = (groupId: string, role: GroupRoles) => {
  const client = useClient();

  const { entities, ...result } = useEntities<BaseGroupMember, GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupId, role],
    () => client.experimental.groups.getGroupMemberships(groupId, role),
    { transform: normalizeGroupMember },
  );

  return {
    ...result,
    groupMembers: entities,
  };
};

export { useGroupMembers };
