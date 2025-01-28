import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

import type { Translation } from 'pl-api';

const statusTranslationQueryOptions = (statusId: string, targetLanguage?: string) => queryOptions<Translation | false>({
  queryKey: ['statuses', 'translations', statusId, targetLanguage],
  queryFn: () => getClient().statuses.translateStatus(statusId, targetLanguage)
    .then(translation => translation).catch(() => false),
  enabled: !!targetLanguage,
});

export { statusTranslationQueryOptions };
