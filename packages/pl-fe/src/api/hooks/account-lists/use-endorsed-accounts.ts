import { useQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

const useEndorsedAccounts = (accountId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['accountsLists', 'endorsedAccounts', accountId],
    queryFn: () => client.accounts.getAccountEndorsements(accountId).then((accounts) => {
      dispatch(importEntities({ accounts }));
      return accounts.map(({ id }) => id);
    }),
  });
};

export { useEndorsedAccounts };
