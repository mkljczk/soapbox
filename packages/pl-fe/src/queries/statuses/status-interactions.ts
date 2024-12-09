import { queryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';
import { store } from 'pl-fe/store';

const queryKey = {
  getDislikedBy: 'statusDislikes',
  getFavouritedBy: 'statusFavourites',
  getRebloggedBy: 'statusReblogs',
};

const makeStatusInteractionsQueryOptions = (method: 'getDislikedBy' | 'getFavouritedBy' | 'getRebloggedBy') => makePaginatedResponseQueryOptions(
  (statusId: string) => ['accountsLists', queryKey[method], statusId],
  (client, params) => client.statuses[method](...params).then(minifyAccountList),
);

const statusInteractionsQueryOptions = {
  statusDislikesQueryOptions: makeStatusInteractionsQueryOptions('getDislikedBy'),
  statusFavouritesQueryOptions: makeStatusInteractionsQueryOptions('getFavouritedBy'),
  statusReblogsQueryOptions: makeStatusInteractionsQueryOptions('getRebloggedBy'),
  statusReactionsQueryOptions: (statusId: string, emoji?: string) => queryOptions({
    queryKey: ['accountsLists', 'statusReactions', statusId, emoji],
    queryFn: () => store.getState().auth.client.statuses.getStatusReactions(statusId, emoji).then((reactions) => {
      store.dispatch(importEntities({ accounts: reactions.map(({ accounts }) => accounts).flat() }));

      return reactions.map(({ accounts, ...reactions }) => reactions);
    }),
    placeholderData: (previousData) => previousData?.filter(({ name }) => name === emoji),
  }),
};

export default statusInteractionsQueryOptions;
