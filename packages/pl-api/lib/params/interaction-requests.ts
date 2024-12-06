import { PaginationParams } from './common';

/**
 * @category Request params
 */
interface GetInteractionRequestsParams extends PaginationParams {
  /** If set, then only interactions targeting the given status_id will be included in the results. */
  status_id?: string;
  /** If true or not set, pending favourites will be included in the results. At least one of favourites, replies, and reblogs must be true. */
  favourites?: boolean;
  /** If true or not set, pending replies will be included in the results. At least one of favourites, replies, and reblogs must be true. */
  replies?: boolean;
  /** If true or not set, pending reblogs will be included in the results. At least one of favourites, replies, and reblogs must be true. */
  reblogs?: boolean;
}

export type {
  GetInteractionRequestsParams,
};
