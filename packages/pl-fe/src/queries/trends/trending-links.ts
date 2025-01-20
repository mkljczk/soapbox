import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

const trendingLinksQueryOptions = queryOptions({
  queryKey: ['trends', 'links'],
  queryFn: () => getClient().trends.getTrendingLinks(),
  // enabled: features.trendingLinks,
});

export { trendingLinksQueryOptions };
