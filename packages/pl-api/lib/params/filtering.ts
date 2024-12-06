import type { PaginationParams, WithRelationshipsParam } from './common';

/**
 * @category Request params
 */
interface MuteAccountParams {
  /** Boolean. Mute notifications in addition to statuses? Defaults to true. */
  notifications?: boolean;
  /** Number. How long the mute should last, in seconds. Defaults to 0 (indefinite). */
  duration?: number;
}

/**
 * @category Request params
 */
type GetMutesParams = Omit<PaginationParams, 'min_id'> & WithRelationshipsParam;

/**
 * @category Request params
 */
type GetBlocksParams = PaginationParams & WithRelationshipsParam;

/**
 * @category Request params
 */
type GetDomainBlocksParams = PaginationParams;

/**
 * @category Request params
 */
type FilterContext = 'home' | 'notifications' | 'public' | 'thread' | 'account';

/**
 * @category Request params
 */
interface CreateFilterParams {
  title: string;
  context: Array<FilterContext>;
  filter_action?: 'warn' | 'hide';
  expires_in?: number;
  keywords_attributes: Array<{
    keyword: string;
    whole_word?: boolean;
  }>;
}

/**
 * @category Request params
 */
interface UpdateFilterParams {
  title?: string;
  context?: Array<FilterContext>;
  filter_action?: 'warn' | 'hide';
  expires_in?: number;
  keywords_attributes?: Array<{
    keyword: string;
    whole_word?: boolean;
    id?: string;
    _destroy?: boolean;
  }>;
}

export type {
  MuteAccountParams,
  GetMutesParams,
  GetBlocksParams,
  GetDomainBlocksParams,
  FilterContext,
  CreateFilterParams,
  UpdateFilterParams,
};
