import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

const hashtagQueryOptions = (tag: string) => queryOptions({
  queryKey: ['hashtags', tag.toLocaleLowerCase()],
  queryFn: () => getClient().myAccount.getTag(tag),
});

export { hashtagQueryOptions };
