import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';

const usePoll = (pollId?: string) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useQuery({
    queryKey: ['polls', 'entities', pollId],
    queryFn: () => client.polls.getPoll(pollId!),
    enabled: !!pollId,
  }, queryClient);
};

export { usePoll };
