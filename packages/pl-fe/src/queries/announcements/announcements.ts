import { queryOptions } from '@tanstack/react-query';
import { announcementReactionSchema, type AnnouncementReaction } from 'pl-api';
import * as v from 'valibot';

import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';

import { mutationOptions } from '../utils/mutation-options';

const updateReaction = (reaction: AnnouncementReaction, count: number, me?: boolean, overwrite?: boolean) => v.parse(announcementReactionSchema, {
  ...reaction,
  me: typeof me === 'boolean' ? me : reaction.me,
  count: overwrite ? count : (reaction.count + count),
});

const updateReactions = (reactions: AnnouncementReaction[], name: string, count: number, me?: boolean, overwrite?: boolean) => {
  const idx = reactions.findIndex(reaction => reaction.name === name);

  if (idx > -1) {
    reactions = reactions.map(reaction => reaction.name === name ? updateReaction(reaction, count, me, overwrite) : reaction);
  }

  return [...reactions, updateReaction(v.parse(announcementReactionSchema, { name }), count, me, overwrite)];
};

const announcementsQueryOptions = queryOptions({
  queryKey: ['announcements'],
  queryFn: () => getClient().announcements.getAnnouncements(),
  placeholderData: [],
  select: (data) => data.toSorted((a, b) =>
    new Date(a.starts_at || a.published_at).getTime() - new Date(b.starts_at || b.published_at).getTime()),
});

const addAnnouncementReactionMutationOptions = mutationOptions({
  mutationFn: ({ announcementId, name }: { announcementId: string; name: string }) =>
    getClient().announcements.addAnnouncementReaction(announcementId, name),
  retry: false,
  onMutate: ({ announcementId: id, name }) => {
    queryClient.setQueryData(announcementsQueryOptions.queryKey, (prevResult) =>
      prevResult?.map(value => value.id !== id ? value : {
        ...value,
        reactions: updateReactions(value.reactions, name, 1, true),
      }),
    );
  },
  onError: (_, { announcementId: id, name }) => {
    queryClient.setQueryData(announcementsQueryOptions.queryKey, (prevResult) =>
      prevResult?.map(value => value.id !== id ? value : {
        ...value,
        reactions: updateReactions(value.reactions, name, -1, false),
      }),
    );
  },
});

const removeAnnouncementReactionMutationOptions = mutationOptions({
  mutationFn: ({ announcementId, name }: { announcementId: string; name: string }) =>
    getClient().announcements.deleteAnnouncementReaction(announcementId, name),
  retry: false,
  onMutate: ({ announcementId: id, name }) => {
    queryClient.setQueryData(announcementsQueryOptions.queryKey, (prevResult) =>
      prevResult?.map(value => value.id !== id ? value : {
        ...value,
        reactions: updateReactions(value.reactions, name, -1, false),
      }),
    );
  },
  onError: (_, { announcementId: id, name }) => {
    queryClient.setQueryData(announcementsQueryOptions.queryKey, (prevResult) =>
      prevResult?.map(value => value.id !== id ? value : {
        ...value,
        reactions: updateReactions(value.reactions, name, 1, true),
      }),
    );
  },
});

export { updateReactions, announcementsQueryOptions, addAnnouncementReactionMutationOptions, removeAnnouncementReactionMutationOptions };
