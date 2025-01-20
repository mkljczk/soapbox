import { queryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

const familiarFollowersQueryOptions = (accountId: string) => queryOptions({
  queryKey: ['accountsLists', 'familiarFollowers', accountId],
  queryFn: () => getClient().accounts.getFamiliarFollowers([accountId]).then((response) => {
    const result = response.find(({ id }) => id === accountId);
    if (!result) return [];

    store.dispatch(importEntities({ accounts: result.accounts }));
    return result.accounts.map(({ id }) => id);
  }),
  // enabled: isLoggedIn && features.familiarFollowers,
});

export { familiarFollowersQueryOptions };
