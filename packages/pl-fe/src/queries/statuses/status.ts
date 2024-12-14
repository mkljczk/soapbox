import { queryOptions } from '@tanstack/react-query';
import { create } from 'mutative';
import { CreateStatusParams, EditStatusParams } from 'pl-api';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { normalizeStatus, type Status } from 'pl-fe/normalizers/status';
import { store } from 'pl-fe/store';

import { queryClient } from '../client';
import { mutationOptions } from '../utils/mutation-options';

import { scheduledStatusesQueryOptions } from './scheduled-statuses';

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

const createStatusMutationOptions = mutationOptions({
  mutationFn: (params: CreateStatusParams) => getClient().statuses.createStatus(params),
  onMutate: (params) => {
    if (params.in_reply_to_id) {
      queryClient.setQueryData(statusQueryOptions(params.in_reply_to_id).queryKey, (status) => status ? create(status, (draft) => {
        draft.replies_count += 1;
      }) : undefined);
    }
    if (params.quote_id) {
      queryClient.setQueryData(statusQueryOptions(params.quote_id).queryKey, (status) => status ? create(status, (draft) => {
        draft.quotes_count += 1;
      }) : undefined);
    }
  },
  onError: (_, params) => {
    if (params.in_reply_to_id) {
      queryClient.setQueryData(statusQueryOptions(params.in_reply_to_id).queryKey, (status) => status ? create(status, (draft) => {
        draft.replies_count = Math.max(draft.replies_count - 1, 0);
      }) : undefined);
    }
    if (params.quote_id) {
      queryClient.setQueryData(statusQueryOptions(params.quote_id).queryKey, (status) => status ? create(status, (draft) => {
        draft.quotes_count = Math.max(draft.quotes_count - 1, 0);
      }) : undefined);
    }
  },
  onSuccess: (status) => {
    if (status.scheduled_at === null) {
      store.dispatch(importEntities({ statuses: [status] }));
      queryClient.setQueryData(statusQueryOptions(status.id).queryKey, normalizeStatus(status));
    } else {
      queryClient.invalidateQueries(scheduledStatusesQueryOptions);
    }
  },
});

const updateStatusMutationOptions = mutationOptions({
  mutationFn: ({ id: statusId, ...params }: EditStatusParams & { id: string }) => getClient().statuses.editStatus(statusId, params),
  onSuccess: (status) => {
    store.dispatch(importEntities({ statuses: [status] }));
    queryClient.setQueryData(statusQueryOptions(status.id).queryKey, normalizeStatus(status));
  },
});

export { statusQueryOptions, createStatusMutationOptions, updateStatusMutationOptions };
