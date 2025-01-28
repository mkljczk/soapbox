import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';

import { mutationOptions } from '../utils/mutation-options';

const relaysQueryOptions = queryOptions({
  queryKey: ['admin', 'relays'],
  queryFn: () => getClient().admin.relays.getRelays(),
});

const followRelayMutationOptions = mutationOptions({
  mutationFn: (relayUrl: string) => getClient().admin.relays.followRelay(relayUrl),
  retry: false,
  onSuccess: (data) => {
    queryClient.setQueryData(relaysQueryOptions.queryKey, (prevResult = []) =>
      [...prevResult, data],
    );
  },
});

const unfollowRelayMutationOptions = mutationOptions({
  mutationFn: (relayUrl: string) => getClient().admin.relays.unfollowRelay(relayUrl),
  retry: false,
  onSuccess: (_, relayUrl) => {
    queryClient.setQueryData(relaysQueryOptions.queryKey, (prevResult = []) =>
      prevResult.filter(({ actor }) => actor !== relayUrl),
    );
  },
});

export { relaysQueryOptions, followRelayMutationOptions, unfollowRelayMutationOptions };
