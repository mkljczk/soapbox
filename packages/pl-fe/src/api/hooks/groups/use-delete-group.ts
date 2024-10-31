import { Entities } from 'pl-fe/entity-store/entities';
import { useDeleteEntity } from 'pl-fe/entity-store/hooks/use-delete-entity';
import { useClient } from 'pl-fe/hooks/use-client';

const useDeleteGroup = () => {
  const client = useClient();

  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.GROUPS,
    (groupId: string) => client.experimental.groups.deleteGroup(groupId),
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
};

export { useDeleteGroup };
