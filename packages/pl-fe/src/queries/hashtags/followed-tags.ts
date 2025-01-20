import { getClient } from 'pl-fe/api';

import { queryClient } from '../client';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { mutationOptions } from '../utils/mutation-options';

import { hashtagQueryOptions } from './hashtag';

const followedTagsQueryOptions = makePaginatedResponseQueryOptions(
  ['followedTags'],
  (client) => client.myAccount.getFollowedTags(),
)();

const followHashtagMutationOptions = (tag: string) => mutationOptions({
  mutationKey: ['followedTags', tag.toLocaleLowerCase()],
  mutationFn: () => getClient().myAccount.followTag(tag),
  onSuccess: (data) => {
    queryClient.invalidateQueries({
      queryKey: ['followedTags'],
    });
    queryClient.setQueryData(hashtagQueryOptions(tag.toLocaleLowerCase()).queryKey, data);
  },
});

const unfollowHashtagMutationOptions = (tag: string) => mutationOptions({
  mutationKey: ['followedTags', tag.toLocaleLowerCase()],
  mutationFn: () => getClient().myAccount.unfollowTag(tag),
  onSuccess: (data) => {
    queryClient.invalidateQueries({
      queryKey: ['followedTags'],
    });
    queryClient.setQueryData(hashtagQueryOptions(tag.toLocaleLowerCase()).queryKey, data);
  },
});

export { followedTagsQueryOptions, followHashtagMutationOptions, unfollowHashtagMutationOptions };
