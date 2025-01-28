import { getClient } from 'pl-fe/api';
import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';

import { makeOptimisticUpdateStatusMutationOptions } from '../statuses/status-interactions';

const eventParticipationsQueryOptions = makePaginatedResponseQueryOptions(
  (statusId: string) => ['accountsLists', 'eventParticipations', statusId],
  (client, params) => client.events.getEventParticipations(...params).then(minifyAccountList),
);

const joinEventMutationOptions = makeOptimisticUpdateStatusMutationOptions({
  mutationFn: ({ statusId, participationMessage }: { statusId: string; participationMessage?: string }) => getClient().events.joinEvent(statusId, participationMessage),
}, (data) => {
  if (data?.event) {
    data.event.join_state = 'pending';
  }
});

const leaveEventMutationOptions = makeOptimisticUpdateStatusMutationOptions({
  mutationFn: (statusId: string) => getClient().events.leaveEvent(statusId),
}, (data) => {
  if (data?.event) {
    data.event.join_state = null;
  }
});

export {
  eventParticipationsQueryOptions,
  joinEventMutationOptions,
  leaveEventMutationOptions,
};
