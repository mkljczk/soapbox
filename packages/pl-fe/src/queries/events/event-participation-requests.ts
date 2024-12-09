import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';
import { makePaginatedResponseQueryOptions } from 'pl-fe/queries/utils/make-paginated-response-query-options';
import { minifyList } from 'pl-fe/queries/utils/minify-list';
import { store } from 'pl-fe/store';

import { mutationOptions } from '../utils/mutation-options';

import type { InfiniteData } from '@tanstack/react-query';
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

const eventParticipationRequestsQueryOptions = makePaginatedResponseQueryOptions(
  (statusId: string) => ['accountsLists', 'eventParticipationRequests', statusId],
  (client, params) => client.events.getEventParticipationRequests(...params).then(minifyRequestList),
);

const acceptEventParticipationRequestMutationOptions = (statusId: string, accountId: string) => mutationOptions({
  mutationKey: ['accountsLists', 'eventParticipationRequests', statusId, accountId],
  mutationFn: () => getClient().events.acceptEventParticipationRequest(statusId, accountId),
  onSettled: () => removeRequest(statusId, accountId),
});

const rejectEventParticipationRequestMutationOptions = (statusId: string, accountId: string) => mutationOptions({
  mutationKey: ['accountsLists', 'eventParticipationRequests', statusId, accountId],
  mutationFn: () => getClient().events.rejectEventParticipationRequest(statusId, accountId),
  onSettled: () => removeRequest(statusId, accountId),
});

export {
  eventParticipationRequestsQueryOptions,
  acceptEventParticipationRequestMutationOptions,
  rejectEventParticipationRequestMutationOptions,
};
