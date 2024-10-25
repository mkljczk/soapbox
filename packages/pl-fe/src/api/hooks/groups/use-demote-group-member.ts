import * as v from 'valibot';

import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks/use-create-entity';
import { useClient } from 'pl-fe/hooks/use-client';
import { normalizeGroupMember } from 'pl-fe/normalizers/group-member';

import type { Group, GroupMember as GroupMember, GroupRole } from 'pl-api';

const useDemoteGroupMember = (group: Pick<Group, 'id'>, groupMember: Pick<GroupMember, 'id'>) => {
  const client = useClient();

  const { createEntity } = useCreateEntity(
    [Entities.GROUP_MEMBERSHIPS, groupMember.id],
    ({ account_ids, role }: { account_ids: string[]; role: GroupRole }) => client.experimental.groups.demoteGroupUsers(group.id, account_ids, role),
    { schema: v.pipe(v.any(), v.transform(arr => arr[0])), transform: normalizeGroupMember },
  );

  return createEntity;
};

export { useDemoteGroupMember };
