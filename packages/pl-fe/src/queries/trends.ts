import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

import type { Tag } from 'pl-api';

const trendsQueryOptions = queryOptions<ReadonlyArray<Tag>>({
  queryKey: ['trends', 'tags'],
  queryFn: () => getClient().trends.getTrendingTags(),
  placeholderData: [],
  staleTime: 600000, // 10 minutes
  // enabled: isLoggedIn && features.trends,
});

export { trendsQueryOptions };
