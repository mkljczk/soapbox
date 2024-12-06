/**
 * @category Request params
 */
interface GetTrends {
  /** Integer. Maximum number of results to return. */
  limit?: number;
  /** Integer. Skip the first n results. */
  offset?: number;
}

/**
 * @category Request params
 */
type GetTrendingTags = GetTrends;

/**
 * @category Request params
 */
type GetTrendingStatuses = GetTrends;

/**
 * @category Request params
 */
type GetTrendingLinks = GetTrends;

export type {
  GetTrendingTags,
  GetTrendingStatuses,
  GetTrendingLinks,
};
