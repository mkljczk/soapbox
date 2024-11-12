import { useQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

const useTrendingStatuses = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const fetchTrendingStatuses = async () => {
    const response = await client.trends.getTrendingStatuses();

    dispatch(importEntities({ statuses: response }));

    return response.map(({ id }) => id);
  };

  return useQuery({
    queryKey: ['trends', 'statuses'],
    queryFn: fetchTrendingStatuses,
    enabled: features.trendingStatuses,
  });
};

export { useTrendingStatuses };
