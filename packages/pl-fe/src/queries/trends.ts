import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import type { Tag } from 'pl-api';

const useTrends = () => {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  const result = useQuery<ReadonlyArray<Tag>>({
    queryKey: ['trends', 'tags'],
    queryFn: () => client.trends.getTrendingTags(),
    placeholderData: [],
    staleTime: 600000, // 10 minutes
    enabled: isLoggedIn && features.trends,
  });

  return result;
};

export { useTrends as default };
