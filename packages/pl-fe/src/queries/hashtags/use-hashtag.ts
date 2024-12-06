import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

const useHashtag = (tag: string) => {
  const client = useClient();

  return useQuery({
    queryKey: ['hashtags', tag.toLocaleLowerCase()],
    queryFn: () => client.myAccount.getTag(tag),
  });
};

export { useHashtag };
