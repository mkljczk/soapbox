import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';

const useStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useQuery({
    queryKey: ['statuses', 'translations', statusId, targetLanguage],
    queryFn: () => client.statuses.translateStatus(statusId, targetLanguage),
    enabled: !!targetLanguage,
  }, queryClient);
};

export { useStatusTranslation };
