import { queryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

const endorsedAccountsQueryOptions = (accountId: string) => queryOptions({
  queryKey: ['accountsLists', 'endorsedAccounts', accountId],
  queryFn: () => getClient().accounts.getAccountEndorsements(accountId).then((accounts) => {
    store.dispatch(importEntities({ accounts }));
    return accounts.map(({ id }) => id);
  }),
});

export { endorsedAccountsQueryOptions };
