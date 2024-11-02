import type { PaginationParams } from './common';

interface GetGroupedNotificationsParams extends PaginationParams {
  /** Types to include in the result. */
  types?: Array<string>;
  /** Types to exclude from the results. */
  exclude_types?: Array<string>;
  /** Return only notifications received from the specified account. */
  acccount_id?: string;
  /** One of `full` (default) or `partial_avatars`. When set to `partial_avatars`, some accounts will not be rendered in full in the returned `accounts` list but will be instead returned in stripped-down form in the `partial_accounts` list. The most recent account in a notification group is always rendered in full in the `accounts` attribute. */
  expand_accounts?: 'full' | 'partial_avatars';
  /** Restrict which notification types can be grouped. Use this if there are notification types for which your client does not support grouping. If omitted, the server will group notifications of all types it supports (currently, `favourite`, `follow` and `reblog`). If you do not want any notification grouping, use GET `/api/v1/notifications` instead. Notifications that would be grouped if not for this parameter will instead be returned as individual single-notification groups with a unique `group_key` that can be assumed to be of the form `ungrouped-{notification_id}`. Please note that neither the streaming API nor the individual notification APIs are aware of this parameter and will always include a “proper” `group_key` that can be different from what is returned here, meaning that you may have to ignore `group_key` for such notifications that you do not want grouped and use `ungrouped-{notification_id}` instead for consistency. */
  grouped_types?: Array<string>;
  /** Whether to include notifications filtered by the user’s NotificationPolicy. Defaults to false. */
  include_filtered?: boolean;
}

export type { GetGroupedNotificationsParams };
