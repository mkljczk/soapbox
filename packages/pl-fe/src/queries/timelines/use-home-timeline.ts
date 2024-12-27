import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { importEntities } from 'pl-fe/actions/importer';
import { useTimelineStream } from 'pl-fe/api/hooks/streaming/use-timeline-stream';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

import { queryClient } from '../client';

import type { PaginatedResponse, Status } from 'pl-api';

type TimelineEntry = {
  type: 'status';
  id: string;
  rebloggedBy: Array<string>;
  isConnectedTop?: boolean;
  isConnectedBottom?: boolean;
} | {
  type: 'pending-status';
  id: string;
} | {
  type: 'gap';
} | {
  type: 'page-start';
  maxId?: string;
} | {
  type: 'page-end';
  minId?: string;
};

const processPage = ({ items: statuses, next }: PaginatedResponse<Status>) => {
  const timelinePage: Array<TimelineEntry> = [];

  // if (previous) timelinePage.push({
  //   type: 'page-start',
  //   maxId: statuses.at(0)?.id,
  // });

  const processStatus = (status: Status) => {
    if (timelinePage.some((entry) => entry.type === 'status' && entry.id === (status.reblog || status).id)) return false;

    let isConnectedTop = false;
    const inReplyToId = (status.reblog || status).in_reply_to_id;

    if (inReplyToId) {
      const foundStatus = statuses.find((status) => (status.reblog || status).id === inReplyToId);

      if (foundStatus) {
        if (processStatus(foundStatus)) {
          const previousEntry = timelinePage.at(-1);

          if (previousEntry?.type === 'status') {
            previousEntry.isConnectedBottom = true;
            isConnectedTop = true;
          }
        }
      }
    }

    if (status.reblog) {
      const existingEntry = timelinePage.find((entry) => entry.type === 'status' && entry.id === status.reblog!.id);

      if (existingEntry?.type === 'status') {
        existingEntry.rebloggedBy.push(status.account.id);
      } else {
        timelinePage.push({
          type: 'status',
          id: status.reblog.id,
          rebloggedBy: [status.account.id],
          isConnectedTop,
        });
      }
      return true;
    }

    timelinePage.push({
      type: 'status',
      id: status.id,
      rebloggedBy: [],
      isConnectedTop,
    });

    return true;
  };

  for (const status of statuses) {
    processStatus(status);
  }

  if (next) timelinePage.push({
    type: 'page-end',
    minId: statuses.at(-1)?.id,
  });

  return timelinePage;
};

const useHomeTimeline = () => {
  const client = useClient();
  const dispatch = useAppDispatch();

  useTimelineStream('home');

  const [isLoading, setIsLoading] = useState(true);

  const queryKey = ['timelines', 'home'];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      setIsLoading(true);

      return client.timelines.homeTimeline()
        .then((response) => {
          dispatch(importEntities({ statuses: response.items }));

          return processPage(response);
        }).catch(() => {})
        .finally(() => setIsLoading(false));
    },
  });

  const handleLoadMore = (entry: TimelineEntry) => {
    if (isLoading) return;

    setIsLoading(true);
    if (entry.type !== 'page-end' && entry.type !== 'page-start') return;

    return client.timelines.homeTimeline(
      entry.type === 'page-end' ? { max_id: entry.minId } : { min_id: entry.maxId },
    ).then((response) => {
      dispatch(importEntities({ statuses: response.items }));

      const timelinePage = processPage(response);

      queryClient.setQueryData<Array<TimelineEntry>>(['timelines', 'home'], (oldData) => {
        if (!oldData) return timelinePage;

        const index = oldData.indexOf(entry);
        return oldData.toSpliced(index, 1, ...timelinePage);
      });
    }).catch(() => {})
      .finally(() => setIsLoading(false));
  };
  return {
    ...query,
    isLoading: isLoading,
    handleLoadMore,
  };
};

export { useHomeTimeline, type TimelineEntry };
