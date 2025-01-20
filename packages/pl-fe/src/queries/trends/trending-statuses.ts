import { queryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

const trendingStatusesQueryOptions = queryOptions({
  queryKey: ['trends', 'statuses'],
  queryFn: async () => {
    const response = await getClient().trends.getTrendingStatuses();

    store.dispatch(importEntities({ statuses: response }));

    return response.map(({ id }) => id);
  },
  // enabled: features.trendingStatuses,
});

export { trendingStatusesQueryOptions };
