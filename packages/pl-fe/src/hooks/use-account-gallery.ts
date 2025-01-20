import { useInfiniteQuery, useQueries } from '@tanstack/react-query';

import { statusQueryOptions } from 'pl-fe/queries/statuses/status';
import { accountMediaTimelineQueryOptions, groupMediaTimelineQueryOptions } from 'pl-fe/queries/timelines/account-media-timeline';

import type { MediaAttachment } from 'pl-api';
import type { Status } from 'pl-fe/normalizers/status';

type AccountGalleryAttachment = MediaAttachment & {
  status: Status;
  account_id: string;
}

const useAccountGallery = (accountId?: string) => {
  const { data: statusIds = [] } = useInfiniteQuery({
    ...accountMediaTimelineQueryOptions(accountId!),
    enabled: !!accountId,
  });

  return useQueries({
    queries: (statusIds || []).map(statusId => statusQueryOptions(statusId)),
  }).reduce<Array<AccountGalleryAttachment>>((medias, { data: status }) => {
    if (!status) return medias;
    if (status.reblog_id) return medias;

    return medias.concat(
      status.media_attachments.map(media => ({ ...media, status, account_id: status.account_id })));
  }, []);
};

const useGroupGallery = (groupId?: string) => {
  const { data: statusIds = [] } = useInfiniteQuery({
    ...groupMediaTimelineQueryOptions(groupId!),
    enabled: !!groupId,
  });

  return useQueries({
    queries: (statusIds || []).map(statusId => statusQueryOptions(statusId)),
  }).reduce<Array<AccountGalleryAttachment>>((medias, { data: status }) => {
    if (!status) return medias;
    if (status.reblog_id) return medias;

    return medias.concat(
      status.media_attachments.map(media => ({ ...media, status, account_id: status.account_id })));
  }, []);
};

export { useAccountGallery, useGroupGallery, type AccountGalleryAttachment };
