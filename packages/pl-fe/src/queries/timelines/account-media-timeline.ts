import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { minifyStatusList } from '../utils/minify-list';

const accountMediaTimelineQueryOptions = makePaginatedResponseQueryOptions(
  (accountId: string) => ['timelineIds', `account:${accountId}:with_replies:media`],
  (client, [accountId]) => client.accounts.getAccountStatuses(accountId!, { only_media: true }).then(minifyStatusList),
);

const groupMediaTimelineQueryOptions = makePaginatedResponseQueryOptions(
  (groupId: string) => ['timelineIds', `group:${groupId}:media`],
  (client, [groupId]) => client.timelines.groupTimeline(groupId!, { only_media: true }).then(minifyStatusList),
);

export { accountMediaTimelineQueryOptions, groupMediaTimelineQueryOptions };
