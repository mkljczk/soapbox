import { Entities } from 'pl-fe/entity-store/entities';
import { useDeleteEntity } from 'pl-fe/entity-store/hooks/use-delete-entity';
import { useClient } from 'pl-fe/hooks/use-client';

import type { Group } from 'pl-api';

const useDeleteGroupStatus = (group: Pick<Group, 'id'>, statusId: string) => {
  const client = useClient();
  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.STATUSES,
    () => client.experimental.groups.deleteGroupStatus(group.id, statusId),
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
};

export { useDeleteGroupStatus };
