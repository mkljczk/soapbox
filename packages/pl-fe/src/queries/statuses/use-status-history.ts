import { useQuery } from '@tanstack/react-query';
import { StatusEdit } from 'pl-api';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

const minifyStatusEdit = ({ account, ...statusEdit }: StatusEdit) => ({
  account_id: account.id,
  ...statusEdit,
});

const useStatusHistory = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['statuses', 'history', statusId],
    queryFn: () => client.statuses.getStatusHistory(statusId)
      .then(history => (dispatch(importEntities({ accounts: history.map(({ account }) => account) })), history))
      .then(history => history.map(minifyStatusEdit)),
  });
};

export { useStatusHistory };
