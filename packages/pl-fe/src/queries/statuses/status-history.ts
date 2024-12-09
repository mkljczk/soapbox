import { queryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

import type { StatusEdit } from 'pl-api';

const minifyStatusEdit = ({ account, ...statusEdit }: StatusEdit) => ({
  account_id: account.id,
  ...statusEdit,
});

const statusHistoryQueryOptions = (statusId: string) => queryOptions({
  queryKey: ['statuses', 'history', statusId],
  queryFn: () => getClient().statuses.getStatusHistory(statusId)
    .then(history => (store.dispatch(importEntities({ accounts: history.map(({ account }) => account) })), history))
    .then(history => history.map(minifyStatusEdit)),
});

export { statusHistoryQueryOptions };
