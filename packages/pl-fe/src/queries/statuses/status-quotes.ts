import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { minifyStatusList } from 'pl-fe/queries/utils/minify-list';

const statusQuotesQueryOptions = makePaginatedResponseQueryOptions(
  (statusId: string) => ['statusLists', 'quotes', statusId],
  (client, params) => client.statuses.getStatusQuotes(...params).then(minifyStatusList),
);

export { statusQuotesQueryOptions };
