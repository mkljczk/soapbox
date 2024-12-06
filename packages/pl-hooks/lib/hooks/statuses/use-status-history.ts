import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { importEntities } from 'pl-hooks/importer';
import { normalizeStatusEdit } from 'pl-hooks/normalizers/status-edit';

const useStatusHistory = (statusId: string) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useQuery({
    queryKey: ['statuses', 'history', statusId],
    queryFn: () => client.statuses.getStatusHistory(statusId)
      .then(history => (importEntities({ accounts: history.map(({ account }) => account) }), history))
      .then(history => history.map(normalizeStatusEdit)),
  }, queryClient);
};

export { useStatusHistory };
