import { useQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

const useFamiliarFollowers = (accountId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  return useQuery({
    queryKey: ['accountsLists', 'familiarFollowers', accountId],
    queryFn: () => client.accounts.getFamiliarFollowers([accountId]).then((response) => {
      const result = response.find(({ id }) => id === accountId);
      if (!result) return [];

      dispatch(importEntities({ accounts: result.accounts }));
      return result.accounts.map(({ id }) => id);
    }),
    enabled: isLoggedIn && features.familiarFollowers,
  });
};

export { useFamiliarFollowers };
