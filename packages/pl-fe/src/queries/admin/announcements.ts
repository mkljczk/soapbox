import { create } from 'mutative';
import {
  adminAnnouncementSchema,
  type PaginatedResponse,
  type AdminAnnouncement,
  type AdminCreateAnnouncementParams,
  type AdminUpdateAnnouncementParams,
} from 'pl-api';
import * as v from 'valibot';

import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';

import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { mutationOptions } from '../utils/mutation-options';

import type { InfiniteData } from '@tanstack/react-query';

const announcementsQueryOptions = makePaginatedResponseQueryOptions(
  () => ['admin', 'announcements'],
  (client) => client.admin.announcements.getAnnouncements(),
);

const createAnnouncementMutationOptions = mutationOptions({
  mutationFn: (params: AdminCreateAnnouncementParams) => getClient().admin.announcements.createAnnouncement(params),
  retry: false,
  onSuccess: (data) => {
    queryClient.setQueryData<InfiniteData<PaginatedResponse<AdminAnnouncement>>>(
      ['admin', 'announcements'],
      (prevData) => create(prevData, (draft) => {
        if (draft?.pages.length) draft.pages[0].items = [v.parse(adminAnnouncementSchema, data), ...draft.pages[0].items];
      }),
    );
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
  },
});

const updateAnnouncementMutationOptions = mutationOptions({
  mutationFn: ({ id, ...params }: AdminUpdateAnnouncementParams & { id: string }) => getClient().admin.announcements.updateAnnouncement(id, params),
  retry: false,
  onSuccess: (data) => {
    queryClient.setQueryData<InfiniteData<PaginatedResponse<AdminAnnouncement>>>(
      ['admin', 'announcements'],
      (prevData) => create(prevData, (draft) => {
        draft?.pages.forEach(({ items }) => {
          const index = items.findIndex(({ id }) => id === data.id);
          if (index !== -1) items[index] = v.parse(adminAnnouncementSchema, data);
        });
      }),
    );
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
  },
});

const deleteAnnouncementMutationOptions = mutationOptions({
  mutationFn: (id: string) => getClient().admin.announcements.deleteAnnouncement(id),
  retry: false,
  onSuccess: (_, deletedAnnouncementId) => {
    queryClient.setQueryData<InfiniteData<PaginatedResponse<AdminAnnouncement>>>(
      ['admin', 'announcements'],
      (prevData) => create(prevData, (draft) => {
        draft?.pages.forEach((page) => page.items = page.items.filter(({ id }) => id !== deletedAnnouncementId));
      }),
    );
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
  },
});

export {
  announcementsQueryOptions,
  createAnnouncementMutationOptions,
  updateAnnouncementMutationOptions,
  deleteAnnouncementMutationOptions,
};
