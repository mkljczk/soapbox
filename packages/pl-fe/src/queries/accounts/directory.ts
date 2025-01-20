import { infiniteQueryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

const directoryQueryOptions = (order: 'active' | 'new', local: boolean = false) => infiniteQueryOptions({
  queryKey: ['accountsLists', 'directory', order, local],
  queryFn: ({ pageParam: offset }) => getClient().instance.profileDirectory({
    order,
    local,
    offset,
  }).then((accounts) => {
    store.dispatch(importEntities({ accounts }));
    return accounts.map(({ id }) => id);
  }),
  initialPageParam: 0,
  getNextPageParam: (_, allPages) => allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
  select: (data) => data?.pages.flat(),
});

export { directoryQueryOptions };
