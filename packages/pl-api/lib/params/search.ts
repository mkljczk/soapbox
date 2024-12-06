import type { PaginationParams, WithRelationshipsParam } from './common';

/**
 * @category Request params
 */
interface SearchParams extends Exclude<PaginationParams, 'since_id'>, WithRelationshipsParam {
  /** String. Specify whether to search for only `accounts`, `hashtags`, `statuses` */
  type?: 'accounts' | 'hashtags' | 'statuses' | 'groups';
  /** Boolean. Only relevant if `type` includes `accounts`. If `true` and (a) the search query is for a remote account (e.g., `someaccount@someother.server`) and (b) the local server does not know about the account, WebFinger is used to try and resolve the account at `someother.server`. This provides the best recall at higher latency. If `false` only accounts the server knows about are returned. */
  resolve?: boolean;
  /** Boolean. Only include accounts that the user is following? Defaults to false. */
  following?: boolean;
  /** String. If provided, will only return statuses authored by this account. */
  account_id?: string;
  /** Boolean. Filter out unreviewed tags? Defaults to false. Use true when trying to find trending tags. */
  exclude_unreviewed?: boolean;
  /** Integer. Skip the first n results. */
  offset?: number;
}

export type {
  SearchParams,
};
