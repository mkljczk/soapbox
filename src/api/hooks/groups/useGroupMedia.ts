import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeStatus } from 'soapbox/normalizers';
import { toSchema } from 'soapbox/utils/normalizers';

const statusSchema = toSchema(normalizeStatus);

const useGroupMedia = (groupId: string) => {
  const client = useClient();

  return useEntities(
    [Entities.STATUSES, 'groupMedia', groupId],
    () => client.request(`/api/v1/timelines/group/${groupId}?only_media=true`),
    { schema: statusSchema })
  ;
};

export { useGroupMedia };