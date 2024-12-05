import { useQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

const queryKey = {
  getDislikedBy: 'statusDislikes',
  getFavouritedBy: 'statusFavourites',
  getRebloggedBy: 'statusReblogs',
};

const makeUseStatusInteractions = (method: 'getDislikedBy' | 'getFavouritedBy' | 'getRebloggedBy') => makePaginatedResponseQuery(
  (statusId: string) => ['accountsLists', queryKey[method], statusId],
  (client, params) => client.statuses[method](...params).then(minifyAccountList),
);

const useStatusDislikes = makeUseStatusInteractions('getDislikedBy');
const useStatusFavourites = makeUseStatusInteractions('getFavouritedBy');
const useStatusReblogs = makeUseStatusInteractions('getRebloggedBy');

const useStatusReactions = (statusId: string, emoji?: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['accountsLists', 'statusReactions', statusId, emoji],
    queryFn: () => client.statuses.getStatusReactions(statusId, emoji).then((reactions) => {
      dispatch(importEntities({ accounts: reactions.map(({ accounts }) => accounts).flat() }));

      return reactions.map(({ accounts, ...reactions }) => reactions);
    }),
    placeholderData: (previousData) => previousData?.filter(({ name }) => name === emoji),
  });
};

export { useStatusDislikes, useStatusFavourites, useStatusReactions, useStatusReblogs };
