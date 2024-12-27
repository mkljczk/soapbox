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
interface GetTrendingStatuses extends GetTrends {
  /**
   * Display trends from a given time range.
   *
   * Requires features{@link Features['trendingStatusesRange']}.
   */
  range?: 'daily' | 'monthly' | 'yearly';
}

/**
 * @category Request params
 */
type GetTrendingLinks = GetTrends;

export type {
  GetTrendingTags,
  GetTrendingStatuses,
  GetTrendingLinks,
};
