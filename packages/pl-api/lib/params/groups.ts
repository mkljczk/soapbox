import type { PaginationParams } from './common';

/**
 * @category Request params
 */
interface CreateGroupParams {
  display_name: string;
  note?: string;
  avatar?: File;
  header?: File;
}

/**
 * @category Request params
 */
interface UpdateGroupParams {
  display_name?: string;
  note?: string;
  avatar?: File | '';
  header?: File | '';
}

/**
 * @category Request params
 */
type GetGroupMembershipsParams = Omit<PaginationParams, 'min_id'>;

/**
 * @category Request params
 */
type GetGroupMembershipRequestsParams = Omit<PaginationParams, 'min_id'>;

/**
 * @category Request params
 */
type GetGroupBlocksParams = Omit<PaginationParams, 'min_id'>;

export type {
  CreateGroupParams,
  UpdateGroupParams,
  GetGroupMembershipsParams,
  GetGroupMembershipRequestsParams,
  GetGroupBlocksParams,
};
