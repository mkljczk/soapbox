import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';

const moderationLogQueryOptions = makePaginatedResponseQueryOptions(
  ['admin', 'moderationLog'],
  (client) => client.admin.moderationLog.getModerationLog(),
)();

export { moderationLogQueryOptions };
