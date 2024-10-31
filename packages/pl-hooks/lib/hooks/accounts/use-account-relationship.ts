import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';

const useAccountRelationship = (accountId?: string) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useQuery({
    queryKey: ['accounts', 'entities', accountId],
    queryFn: async () => (await client.accounts.getRelationships([accountId!]))[0],
    enabled: !!accountId,
  }, queryClient);
};

export { useAccountRelationship };
