import type { PaginationParams } from './common';

/**
 * @category Request params
 */
interface GetNotificationParams extends PaginationParams {
  /** Types to include in the result. */
  types?: string[];
  /** Types to exclude from the results. */
  exclude_types?: string[];
  /** Return only notifications received from the specified account. */
  account_id?: string;
  /**
   * Whether to include notifications filtered by the user’s NotificationPolicy. Defaults to false.
   * Requires features.{@link Features['notificationsPolicy']}.
   */
  include_filtered?: boolean;
  /**
   * will exclude the notifications for activities with the given visibilities. The parameter accepts an array of visibility types (`public`, `unlisted`, `private`, `direct`).
   * Requires features{@link Features['notificationsExcludeVisibilities']}.
   */
  exclude_visibilities?: string[];
}

/**
 * @category Request params
 */
interface GetUnreadNotificationCountParams {
  /** Maximum number of results to return. Defaults to 100 notifications. Max 1000 notifications. */
  limit?: number;
  /** Types of notifications that should count towards unread notifications. */
  types?: string[];
  /** Types of notifications that should not count towards unread notifications */
  exclude_types?: string[];
  /** Only count unread notifications received from the specified account. */
  account_id?: string;
}

/**
 * @category Request params
 */
interface UpdateNotificationPolicyRequest {
  /** Whether to `accept`, `filter` or `drop` notifications from accounts the user is not following. */
  for_not_following?: boolean;
  /** Whether to `accept`, `filter` or `drop` notifications from accounts that are not following the user. */
  for_not_followers?: boolean;
  /** Whether to `accept`, `filter` or `drop` notifications from accounts created in the past 30 days. */
  for_new_accounts?: boolean;
  /** Whether to `accept`, `filter` or `drop` notifications from private mentions. drop will prevent creation of the notification object altogether (without preventing the underlying activity), */
  for_private_mentions?: boolean;
  /** Whether to `accept`, `filter` or `drop` notifications from accounts that were limited by a moderator. */
  for_limited_accounts?: boolean;
}

/**
 * @category Request params
 */
type GetNotificationRequestsParams = PaginationParams;

export type {
  GetNotificationParams,
  GetUnreadNotificationCountParams,
  UpdateNotificationPolicyRequest,
  GetNotificationRequestsParams,
};
