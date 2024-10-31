import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { queryClient, usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { type NormalizedNotification, normalizeNotification } from 'pl-hooks/normalizers/notification';

import { useAccount } from '../accounts/use-account';
import { useStatus } from '../statuses/use-status';

import type { NormalizedAccount as Account } from 'pl-hooks/normalizers/account';
import type { NormalizedStatus as Status } from 'pl-hooks/normalizers/status';

const getNotificationStatusId = (n: NormalizedNotification) => {
  if (['mention', 'status', 'reblog', 'favourite', 'poll', 'update', 'emoji_reaction', 'event_reminder', 'participation_accepted', 'participation_request'].includes(n.type))
    // @ts-ignore
    return n.status_id;
  return null;
};

const importNotification = (notification: NormalizedNotification) => {
  queryClient.setQueryData<NormalizedNotification>(
    ['notifications', 'entities', notification.id],
    existingNotification => existingNotification?.duplicate ? existingNotification : notification,
  );
};

const useNotification = (notificationId: string) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  const notificationQuery = useQuery({
    queryKey: ['notifications', 'entities', notificationId],
    queryFn: () => client.notifications.getNotification(notificationId)
      .then(normalizeNotification),
  }, queryClient);

  const notification = notificationQuery.data;

  const accountsQuery = queryClient.getQueriesData<Account>({
    queryKey: ['accounts', 'entities', notification?.account_ids],
  });

  const moveTargetAccountQuery = useAccount(notification?.type === 'move' ? notification.target_id : undefined);
  const statusQuery = useStatus(notification ? getNotificationStatusId(notification) : false);

  let data: (NormalizedNotification & {
    account: Account;
    accounts: Array<Account>;
    target: Account | undefined;
    status: Status | undefined;
  }) | undefined;

  if (notification) {
    data = {
      ...notification,
      account: accountsQuery[0][1]!,
      accounts: accountsQuery.map(([_, account]) => account!).filter(Boolean),
      target: moveTargetAccountQuery.data,
      status: statusQuery.data,
    };
  }

  return { ...notificationQuery, data };
};

export { useNotification, importNotification };
