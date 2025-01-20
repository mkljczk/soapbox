import { Entities } from 'pl-fe/entity-store/entities';
import { useEntities } from 'pl-fe/entity-store/hooks/use-entities';
import { useClient } from 'pl-fe/hooks/use-client';
import { normalizeStatus } from 'pl-fe/normalizers/status';

const useGroupMedia = (groupId: string) => {
  const client = useClient();

  return useEntities(
    [Entities.STATUSES, 'groupMedia', groupId],
    () => client.timelines.groupTimeline(groupId, { only_media: true }),
    { transform: normalizeStatus });
};

export { useGroupMedia };
