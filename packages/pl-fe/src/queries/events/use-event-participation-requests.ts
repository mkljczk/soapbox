
import { type InfiniteData, useMutation } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { minifyList } from 'pl-fe/queries/utils/minify-list';
import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';
import { store } from 'pl-fe/store';

import type { PlApiClient } from 'pl-api';

const minifyRequestList = (response: Awaited<ReturnType<(InstanceType<typeof PlApiClient>)['events']['getEventParticipationRequests']>>) =>
  minifyList(
    response,
    ({ account, participation_message }) => ({ account_id: account.id, participation_message }),
    (requests) => store.dispatch(importEntities({ accounts: requests.map(request => request.account) }) as any),
  );

type MinifiedRequestList = ReturnType<typeof minifyRequestList>

const removeRequest = (statusId: string, accountId: string) =>
  queryClient.setQueryData<InfiniteData<MinifiedRequestList>>(['accountsLists', 'eventParticipationRequests', statusId], (data) => data ? {
    ...data,
    pages: data.pages.map(({ items, ...page }) => ({ ...page, items: items.filter(({ account_id }) => account_id !== accountId) })),
  } : undefined);

const useEventParticipationRequests = makePaginatedResponseQuery(
  (statusId: string) => ['accountsLists', 'eventParticipationRequests', statusId],
  (client, params) => client.events.getEventParticipationRequests(...params).then(minifyRequestList),
);

const useAcceptEventParticipationRequestMutation = (statusId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'eventParticipationRequests', statusId, accountId],
    mutationFn: () => client.events.acceptEventParticipationRequest(statusId, accountId),
    onSettled: () => removeRequest(statusId, accountId),
  });
};

const useRejectEventParticipationRequestMutation = (statusId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'eventParticipationRequests', statusId, accountId],
    mutationFn: () => client.events.rejectEventParticipationRequest(statusId, accountId),
    onSettled: () => removeRequest(statusId, accountId),
  });
};
export {
  useEventParticipationRequests,
  useAcceptEventParticipationRequestMutation,
  useRejectEventParticipationRequestMutation,
};
