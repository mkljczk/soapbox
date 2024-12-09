import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';

const eventParticipationsQueryOptions = makePaginatedResponseQueryOptions(
  (statusId: string) => ['accountsLists', 'eventParticipations', statusId],
  (client, params) => client.events.getEventParticipations(...params).then(minifyAccountList),
);

export { eventParticipationsQueryOptions };
