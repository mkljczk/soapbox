import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';
import { buildCustomEmojis } from 'pl-fe/features/emoji';
import { addCustomToPool } from 'pl-fe/features/emoji/search';

import { queryClient } from '../client';

import type { PlApiClient } from 'pl-api';

const customEmojisQueryOptions = queryOptions({
  queryKey: ['instance', 'customEmojis'],
  queryFn: () => getClient().instance.getCustomEmojis().then((emojis) => {
    addCustomToPool(buildCustomEmojis(emojis));
    return emojis;
  }),
});


const prefetchCustomEmojis = (client: PlApiClient) => queryClient.prefetchQuery(customEmojisQueryOptions);

export { customEmojisQueryOptions, prefetchCustomEmojis };
