import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks/use-create-entity';
import { useClient } from 'pl-fe/hooks/use-client';

import type { Group } from 'pl-api';
import type { Account } from 'pl-fe/normalizers/account';

const useBlockGroupMember = (group: Pick<Group, 'id'>, account: Pick<Account, 'id'>) => {
  const client = useClient();

  const { createEntity } = useCreateEntity(
    [Entities.GROUP_MEMBERSHIPS, account.id],
    (accountIds: string[]) => client.experimental.groups.blockGroupUsers(group.id, accountIds),
  );

  return createEntity;
};

export { useBlockGroupMember };
