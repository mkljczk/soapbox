import { type InfiniteData, useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { importEntities } from 'pl-hooks/importer';
import { usePlHooksApiClient } from 'pl-hooks/main';

import type { InteractionRequest, PaginatedResponse } from 'pl-api';

const minifyInteractionRequest = ({ account, status, reply, ...interactionRequest }: InteractionRequest) => ({
  account_id: account.id,
  status_id: status?.id || null,
  reply_id: reply?.id || null,
  ...interactionRequest,
});

type MinifiedInteractionRequest = ReturnType<typeof minifyInteractionRequest>;

const minifyInteractionRequestsList = ({ previous, next, items, ...response }: PaginatedResponse<InteractionRequest>): PaginatedResponse<MinifiedInteractionRequest> => {
  importEntities({
    statuses: items.map(item => [item.status, item.reply]).flat(),
  });

  return {
    ...response,
    previous: previous ? () => previous().then(response => minifyInteractionRequestsList(response)) : null,
    next: next ? () => next().then(response => minifyInteractionRequestsList(response)) : null,
    items: items.map(minifyInteractionRequest),
  };
};

const useInteractionRequests = <T>(
  select?: ((data: InfiniteData<PaginatedResponse<MinifiedInteractionRequest>>) => T),
) => {
  const { client } = usePlHooksApiClient();
  const features = client.features;

  return useInfiniteQuery({
    queryKey: ['statuses', 'interactionRequests'],
    queryFn: ({ pageParam }) => pageParam.next?.() || client.interactionRequests.getInteractionRequests().then(response => minifyInteractionRequestsList(response)),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as PaginatedResponse<MinifiedInteractionRequest>,
    getNextPageParam: (page) => page.next ? page : undefined,
    enabled: features.interactionRequests,
    select,
  });
};

const useFlatInteractionRequests = () => useInteractionRequests(
  (data: InfiniteData<PaginatedResponse<MinifiedInteractionRequest>>) => data.pages.map(page => page.items).flat(),
);

const useInteractionRequestsCount = () => useInteractionRequests(data => data.pages.map(({ items }) => items).flat().length);

const useAuthorizeInteractionRequestMutation = (requestId: string) => {
  const { client } = usePlHooksApiClient();
  const { refetch } = useInteractionRequests();

  return useMutation({
    mutationKey: ['statuses', 'interactionRequests', requestId],
    mutationFn: () => client.interactionRequests.authorizeInteractionRequest(requestId),
    onSettled: () => refetch(),
  });
};

const useRejectInteractionRequestMutation = (requestId: string) => {
  const { client } = usePlHooksApiClient();
  const { refetch } = useInteractionRequests();

  return useMutation({
    mutationKey: ['statuses', 'interactionRequests', requestId],
    mutationFn: () => client.interactionRequests.rejectInteractionRequest(requestId),
    onSettled: () => refetch(),
  });
};

export {
  useInteractionRequests,
  useInteractionRequestsCount,
  useFlatInteractionRequests,
  useAuthorizeInteractionRequestMutation,
  useRejectInteractionRequestMutation,
  type MinifiedInteractionRequest,
};
