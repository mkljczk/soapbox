import { type InfiniteData, infiniteQueryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store, type AppDispatch } from 'pl-fe/store';

import { queryClient } from '../client';
import { mutationOptions } from '../utils/mutation-options';

import type { InteractionRequest, PaginatedResponse } from 'pl-api';

const minifyInteractionRequest = ({ account, status, reply, ...interactionRequest }: InteractionRequest) => ({
  account_id: account.id,
  status_id: status?.id || null,
  reply_id: reply?.id || null,
  ...interactionRequest,
});

type MinifiedInteractionRequest = ReturnType<typeof minifyInteractionRequest>;

const minifyInteractionRequestsList = (dispatch: AppDispatch, { previous, next, items, ...response }: PaginatedResponse<InteractionRequest>): PaginatedResponse<MinifiedInteractionRequest> => {
  dispatch(importEntities({
    statuses: items.map(item => [item.status, item.reply]).flat(),
  }));

  return {
    ...response,
    previous: previous ? () => previous().then(response => minifyInteractionRequestsList(dispatch, response)) : null,
    next: next ? () => next().then(response => minifyInteractionRequestsList(dispatch, response)) : null,
    items: items.map(minifyInteractionRequest),
  };
};

const interactionRequestsQueryOptions = <T = Array<MinifiedInteractionRequest>>(
  select?: (data: InfiniteData<PaginatedResponse<MinifiedInteractionRequest>>) => T,
) => infiniteQueryOptions({
    queryKey: ['interactionRequests'],
    queryFn: ({ pageParam }) => pageParam.next?.() || getClient().interactionRequests.getInteractionRequests().then(response => minifyInteractionRequestsList(store.dispatch, response)),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as PaginatedResponse<MinifiedInteractionRequest>,
    getNextPageParam: (page) => page.next ? page : undefined,
    // enabled: features.interactionRequests,
    select: select ?? ((data) => data.pages.map(page => page.items).flat() as T),
  });

const interactionRequestsCountQueryOptions = interactionRequestsQueryOptions(data => data.pages.map(({ items }) => items).flat().length);

const authorizeInteractionRequestMutationOptions = (requestId: string) => mutationOptions({
  mutationKey: ['interactionRequests', requestId],
  mutationFn: () => getClient().interactionRequests.authorizeInteractionRequest(requestId),
  onSettled: () => queryClient.refetchQueries(interactionRequestsCountQueryOptions),
});

const rejectInteractionRequestMutationOptions = (requestId: string) => mutationOptions({
  mutationKey: ['interactionRequests', requestId],
  mutationFn: () => getClient().interactionRequests.rejectInteractionRequest(requestId),
  onSettled: () => queryClient.refetchQueries(interactionRequestsCountQueryOptions),
});

export default {
  interactionRequestsQueryOptions,
  interactionRequestsCountQueryOptions,
  authorizeInteractionRequestMutationOptions,
  rejectInteractionRequestMutationOptions,
};
