import type { PaginationParams } from './common';

/**
 * @category Request params
 */
interface GetBookmarksParams extends PaginationParams {
  /**
   * Bookmark folder ID
   * Requires `features.bookmarkFolders`.
   */
  folder_id?: string;
}

/**
 * @category Request params
 */
type GetFavouritesParams = PaginationParams;

/**
 * @category Request params
 */
type GetFollowRequestsParams = Omit<PaginationParams, 'min_id'>;

/**
 * @category Request params
 */
type GetEndorsementsParams = Omit<PaginationParams, 'min_id'>;

/**
 * @category Request params
 */
type GetFollowedTagsParams = PaginationParams;

/**
 * @category Request params
 */
interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

/**
 * @category Request params
 */
type UpdateBookmarkFolderParams = Partial<CreateBookmarkFolderParams>;

export type {
  GetBookmarksParams,
  GetFavouritesParams,
  GetFollowRequestsParams,
  GetEndorsementsParams,
  GetFollowedTagsParams,
  CreateBookmarkFolderParams,
  UpdateBookmarkFolderParams,
};
