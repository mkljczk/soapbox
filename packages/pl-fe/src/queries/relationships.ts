import { useMutation } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

const useFetchRelationships = () => {
  const client = useClient();

  return useMutation({
    mutationFn: ({ accountIds }: { accountIds: string[]}) =>
      client.accounts.getRelationships(accountIds),
  });
};

export { useFetchRelationships };
