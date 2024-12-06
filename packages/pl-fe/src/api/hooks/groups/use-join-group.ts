import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks/use-create-entity';
import { useClient } from 'pl-fe/hooks/use-client';

import { useGroups } from './use-groups';

import type { Group } from 'pl-api';

const useJoinGroup = (group: Pick<Group, 'id'>) => {
  const client = useClient();
  const { invalidate } = useGroups();

  const { createEntity, isSubmitting } = useCreateEntity(
    [Entities.GROUP_RELATIONSHIPS, group.id],
    () => client.experimental.groups.joinGroup(group.id),
  );

  return {
    mutate: createEntity,
    isSubmitting,
    invalidate,
  };
};

export { useJoinGroup };
