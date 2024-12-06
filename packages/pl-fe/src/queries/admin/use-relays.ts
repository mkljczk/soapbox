import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';

import type { AdminRelay } from 'pl-api';

const useRelays = () => {
  const client = useClient();

  const getRelays = () => client.admin.relays.getRelays();

  const result = useQuery<ReadonlyArray<AdminRelay>>({
    queryKey: ['admin', 'relays'],
    queryFn: getRelays,
    placeholderData: [],
  });

  const {
    mutate: followRelay,
    isPending: isPendingFollow,
  } = useMutation({
    mutationFn: (relayUrl: string) => client.admin.relays.followRelay(relayUrl),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(['admin', 'relays'], (prevResult: ReadonlyArray<AdminRelay>) =>
        [...prevResult, data],
      ),
  });

  const {
    mutate: unfollowRelay,
    isPending: isPendingUnfollow,
  } = useMutation({
    mutationFn: (relayUrl: string) => client.admin.relays.unfollowRelay(relayUrl),
    retry: false,
    onSuccess: (_, relayUrl) =>
      queryClient.setQueryData(['admin', 'relays'], (prevResult: ReadonlyArray<AdminRelay>) =>
        prevResult.filter(({ actor }) => actor !== relayUrl),
      ),
  });

  return {
    ...result,
    followRelay,
    isPendingFollow,
    unfollowRelay,
    isPendingUnfollow,
  };
};

export { useRelays };
