import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

const useTrendingLinks = () => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['trends', 'links'],
    queryFn: () => client.trends.getTrendingLinks(),
    enabled: features.trendingLinks,
  });
};

export { useTrendingLinks };
