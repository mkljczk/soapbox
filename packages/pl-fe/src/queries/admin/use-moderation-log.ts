import { useInfiniteQuery } from '@tanstack/react-query';
import { PaginatedResponse } from 'pl-api';

import { useClient } from 'pl-fe/hooks/use-client';
import { flattenPages } from 'pl-fe/utils/queries';

import type { AdminModerationLogEntry } from 'pl-api';

const useModerationLog = () => {
  const client = useClient();

  const getModerationLog = (pageParam?: Pick<PaginatedResponse<AdminModerationLogEntry>, 'next'>): Promise<PaginatedResponse<AdminModerationLogEntry>> =>
    (pageParam?.next || client.admin.moderationLog.getModerationLog)();

  const queryInfo = useInfiniteQuery({
    queryKey: ['admin', 'moderation_log'],
    queryFn: ({ pageParam }) => getModerationLog(pageParam),
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<AdminModerationLogEntry>>) | null },
    getNextPageParam: (config) => config.next ? config : undefined,
  });

  const data = flattenPages(queryInfo.data) || [];

  return {
    ...queryInfo,
    data,
  };
};

export { useModerationLog };
