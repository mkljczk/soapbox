import { queryOptions, useQuery } from '@tanstack/react-query';

import { buildCustomEmojis } from 'pl-fe/features/emoji';
import { addCustomToPool } from 'pl-fe/features/emoji/search';
import { useClient } from 'pl-fe/hooks/use-client';

import { queryClient } from '../client';

import type { CustomEmoji, PlApiClient } from 'pl-api';

const customEmojisQueryOptions = (client: PlApiClient) => queryOptions({
  queryKey: ['instance', 'customEmojis'],
  queryFn: () => client.instance.getCustomEmojis().then((emojis) => {
    addCustomToPool(buildCustomEmojis(emojis));
    return emojis;
  }),
});

const useCustomEmojis = <T>(select?: (data: Array<CustomEmoji>) => T) => {
  const client = useClient();

  return useQuery({
    ...customEmojisQueryOptions(client),
    select: select ?? ((data) => data as T),
  });
};

const prefetchCustomEmojis = (client: PlApiClient) => queryClient.prefetchQuery(customEmojisQueryOptions(client));

export { useCustomEmojis, prefetchCustomEmojis };
