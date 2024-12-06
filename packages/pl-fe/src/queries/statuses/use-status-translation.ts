import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

import type { Translation } from 'pl-api';

const useStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const client = useClient();

  return useQuery<Translation | false>({
    queryKey: ['statuses', 'translations', statusId, targetLanguage],
    queryFn: () => client.statuses.translateStatus(statusId, targetLanguage)
      .then(translation => translation).catch(() => false),
    enabled: !!targetLanguage,
  });
};

export { useStatusTranslation };
