import { makePaginatedResponseQuery } from 'pl-fe/api/utils/make-paginated-response-query';
import { minifyStatusList } from 'pl-fe/api/utils/minify-list';

const useStatusQuotes = makePaginatedResponseQuery(
  (statusId: string) => ['statusLists', 'quotes', statusId],
  (client, params) => client.statuses.getStatusQuotes(...params).then(minifyStatusList),
);

export { useStatusQuotes };
