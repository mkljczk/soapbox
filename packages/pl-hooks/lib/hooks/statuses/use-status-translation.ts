import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';

import type { Translation } from 'pl-api';

const useStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useQuery<Translation | false>({
    queryKey: ['statuses', 'translations', statusId, targetLanguage],
    queryFn: () => client.statuses.translateStatus(statusId, targetLanguage).then(translation => translation).catch(() => false),
    enabled: !!targetLanguage,
  }, queryClient);
};

export { useStatusTranslation };
