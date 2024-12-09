import { infiniteQueryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store, type AppDispatch } from 'pl-fe/store';

import { queryClient } from '../client';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
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

const interactionRequestsQueryOptions = makePaginatedResponseQueryOptions(
  () => ['interactionRequests'],
  (client) => client.interactionRequests.getInteractionRequests().then(response => minifyInteractionRequestsList(store.dispatch, response)),
)();

const interactionRequestsCountQueryOptions = infiniteQueryOptions({
  ...interactionRequestsQueryOptions,
  select: (data => data.pages.map(({ items }) => items).flat().length),
});

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

export {
  interactionRequestsQueryOptions,
  interactionRequestsCountQueryOptions,
  authorizeInteractionRequestMutationOptions,
  rejectInteractionRequestMutationOptions,
  type MinifiedInteractionRequest,
};
