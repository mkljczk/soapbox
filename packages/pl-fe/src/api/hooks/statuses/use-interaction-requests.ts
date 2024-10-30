import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

import type { InteractionRequest, PaginatedResponse } from 'pl-api';
import type { AppDispatch } from 'pl-fe/store';

const minifyInteractionRequest = ({ account, status, reply, ...interactionRequest }: InteractionRequest) => ({
  account_id: account.id,
  status: status?.id || null,
  reply: reply?.id || null,
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

const useInteractionRequests = <T>(select?: (data: InfiniteData<PaginatedResponse<MinifiedInteractionRequest>>) => T) => {
  const client = useClient();
  const features = useFeatures();
  const dispatch = useAppDispatch();

  return useInfiniteQuery({
    queryKey: ['interaction_requests'],
    queryFn: ({ pageParam }) => pageParam.next?.() || client.interactionRequests.getInteractionRequests().then(response => minifyInteractionRequestsList(dispatch, response)),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as PaginatedResponse<MinifiedInteractionRequest>,
    getNextPageParam: (page) => page.next ? page : undefined,
    enabled: features.interactionRequests,
    select,
  });
};

const useInteractionRequestsCount = () => useInteractionRequests(data => data.pages.map(({ items }) => items).flat().length);

export { useInteractionRequests, useInteractionRequestsCount };
