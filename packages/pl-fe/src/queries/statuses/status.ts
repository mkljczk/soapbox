import { queryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { normalizeStatus, type Status } from 'pl-fe/normalizers/status';
import { store } from 'pl-fe/store';

import { queryClient } from '../client';

const statusQueryOptions = (statusId?: string, language?: string) => queryOptions({
  queryKey: ['statuses', 'entites', statusId],
  queryFn: () => {
    const params = language ? { language } : undefined;

    return getClient().statuses.getStatus(statusId!, params).then((status) => {
      const oldStatus = queryClient.getQueryData<Status>(['statuses', 'entities', statusId]);

      store.dispatch(importEntities({ statuses: [status] }));
      return normalizeStatus(status, oldStatus);
    });
  },
  enabled: !!statusId,
});

export { statusQueryOptions };
