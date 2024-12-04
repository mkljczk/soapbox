
import { InfiniteData, useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { minifyList } from 'pl-fe/api/normalizers/minify-list';
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

const useEventParticipationRequests = (statusId: string) => {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: ['accountsLists', 'eventParticipationRequests', statusId],
    queryFn: ({ pageParam }) => pageParam.next?.() || client.events.getEventParticipationRequests(statusId).then(minifyRequestList),
    initialPageParam: { previous: null, next: null, items: [], partial: false } as MinifiedRequestList,
    getNextPageParam: (page) => page.next ? page : undefined,
    select: (data) => data.pages.map(page => page.items).flat(),
  });
};

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
