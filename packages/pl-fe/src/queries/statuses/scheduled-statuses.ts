import { infiniteQueryOptions } from '@tanstack/react-query';
import { create } from 'mutative';

import { getClient } from 'pl-fe/api';

import { queryClient } from '../client';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { mutationOptions } from '../utils/mutation-options';

const scheduledStatusesQueryOptions = makePaginatedResponseQueryOptions(
  ['scheduledStatuses'],
  (client) => client.scheduledStatuses.getScheduledStatuses(),
)();

const scheduledStatusesCountQueryOptions = infiniteQueryOptions({
  ...scheduledStatusesQueryOptions,
  select: (data) => data.pages.map(page => page.items).flat().length,
});

const cancelScheduledStatusMutationOptions = (scheduledStatusId: string) => mutationOptions({
  mutationKey: ['scheduledStatuses', scheduledStatusId],
  mutationFn: () => getClient().scheduledStatuses.cancelScheduledStatus(scheduledStatusId),
  onSettled: () => {
    queryClient.setQueryData(scheduledStatusesQueryOptions.queryKey, (data) => create(data, (draft) => {
      draft?.pages.forEach(page => page.items = page.items.filter(({ id }) => id !== scheduledStatusId));
    }));
  },
});

export { scheduledStatusesQueryOptions, scheduledStatusesCountQueryOptions, cancelScheduledStatusMutationOptions };
