import { useQuery } from '@tanstack/react-query';

import { fetchTrendsSuccess } from 'pl-fe/actions/trends';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import type { Tag } from 'pl-api';

const useTrends = () => {
  const dispatch = useAppDispatch();
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const getTrends = async() => {
    const data = await client.trends.getTrendingTags();

    dispatch(fetchTrendsSuccess(data));

    return data;
  };

  const result = useQuery<ReadonlyArray<Tag>>({
    queryKey: ['trends'],
    queryFn: getTrends,
    placeholderData: [],
    staleTime: 600000, // 10 minutes
    enabled: isLoggedIn,
  });

  return result;
};

export { useTrends as default };
