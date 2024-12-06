import type { PaginationParams } from './common';

/**
 * @category Request params
 */
interface CreateListParams {
  /** String. The title of the list to be created. */
  title: string;
  /** String. One of followed, list, or none. Defaults to list. */
  replies_policy?: 'followed' | 'list' | 'none';
  /** Boolean. Whether members of this list need to get removed from the “Home” feed */
  exclusive?: boolean;
}

/**
 * @category Request params
 */
type UpdateListParams = CreateListParams;

/**
 * @category Request params
 */
type GetListAccountsParams = PaginationParams;

export type {
  CreateListParams,
  UpdateListParams,
  GetListAccountsParams,
};
