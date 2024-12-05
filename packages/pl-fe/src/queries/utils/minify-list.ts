import { Account, PaginatedResponse, Status } from 'pl-api';

import { importEntities } from 'pl-fe/actions/importer';
import { store } from 'pl-fe/store';

const minifyList = <T1, T2>({ previous, next, items, ...response }: PaginatedResponse<T1>, minifier: (value: T1) => T2, importer?: (items: Array<T1>) => void): PaginatedResponse<T2> => {
  importer?.(items);

  return {
    ...response,
    previous: previous ? () => previous().then((list) => minifyList(list, minifier, importer)) : null,
    next: next ? () => next().then((list) => minifyList(list, minifier, importer)) : null,
    items: items.map(minifier),
  };
};

const minifyStatusList = (response: PaginatedResponse<Status>): PaginatedResponse<string> =>
  minifyList(response, (status) => status.id, (statuses) => {
    store.dispatch(importEntities({ statuses }) as any);
  });

const minifyAccountList = (response: PaginatedResponse<Account>): PaginatedResponse<string> =>
  minifyList(response, (account) => account.id, (accounts) => {
    store.dispatch(importEntities({ accounts }) as any);
  });

export { minifyList, minifyAccountList, minifyStatusList };
