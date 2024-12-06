import { useMutation } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';

import type { Timeline } from './use-markers';
import type { Marker } from 'pl-api';

const useUpdateMarkerMutation = (timeline: Timeline) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useMutation({
    mutationFn: (lastReadId: string) => client.timelines.saveMarkers({
      [timeline]: {
        last_read_id: lastReadId,
      },
    }),
    retry: false,
    onMutate: (lastReadId) => queryClient.setQueryData<Marker>(['markers', timeline], (marker) => marker ? ({
      ...marker,
      last_read_id: lastReadId,
    }) : undefined),
  }, queryClient);
};

export { useUpdateMarkerMutation };
