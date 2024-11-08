import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { queryClient, usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';

import type { PlApiClient } from 'pl-api';

type Timeline = 'home' | 'notifications';

const useMarker = (timeline: Timeline) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useQuery({
    queryKey: ['markers', timeline],
    queryFn: () => client.timelines.getMarkers([timeline]).then(markers => markers[timeline]),
  }, queryClient);
};

const prefetchMarker = (client: PlApiClient, timeline: 'home' | 'notifications') =>
  queryClient.prefetchQuery({
    queryKey: ['markers', timeline],
    queryFn: () => client.timelines.getMarkers([timeline]).then(markers => markers[timeline]),
  });

export { useMarker, prefetchMarker, type Timeline };
