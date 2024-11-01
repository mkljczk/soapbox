import type { LanguageParam, OnlyEventsParam, OnlyMediaParam, PaginationParams, WithMutedParam } from './common';

/**
 * @category Request params
 */
interface PublicTimelineParams extends PaginationParams, WithMutedParam, OnlyEventsParam, OnlyMediaParam, LanguageParam {
  /** Boolean. Show only local statuses? Defaults to false. */
  local?: boolean;
  /** Boolean. Show only remote statuses? Defaults to false. */
  remote?: boolean;
  /**
   * Boolean. Show only statuses from the given domain.
   *
   * Requires features{@link Features['instanceTimeline']}.
   */
  instance?: string;
}

/**
 * @category Request params
 */
interface HashtagTimelineParams extends PaginationParams, WithMutedParam, OnlyEventsParam, OnlyMediaParam, LanguageParam {
  /** Array of String. Return statuses that contain any of these additional tags. */
  any?: string[];
  /** Array of String. Return statuses that contain all of these additional tags. */
  all?: string[];
  /** Array of String. Return statuses that contain none of these additional tags. */
  none?: string[];
  /** Boolean. Show only local statuses? Defaults to false. */
  local?: boolean;
  /** Boolean. Show only remote statuses? Defaults to false. */
  remote?: boolean;
}

/**
 * @category Request params
 */
type HomeTimelineParams = PaginationParams & WithMutedParam & OnlyEventsParam & LanguageParam;

/**
 * @category Request params
 */
type LinkTimelineParams = PaginationParams & WithMutedParam & LanguageParam;

/**
 * @category Request params
 */
type ListTimelineParams = PaginationParams & WithMutedParam & OnlyEventsParam & LanguageParam;

/**
 * @category Request params
 */
interface GetConversationsParams extends PaginationParams, LanguageParam {
  /**
   * Only return conversations with the given recipients (a list of user ids).
   * Requires features{@link Features['conversationsByRecipients']}.
   * */
  recipients?: string[];
}

/**
 * @category Request params
 */
interface SaveMarkersParams {
  home?: {
    /** String. ID of the last status read in the home timeline. */
    last_read_id?: string;
  };
  notifications?: {
    /** String. ID of the last notification read. */
    last_read_id?: string;
  };
}

/**
 * @category Request params
 */
type GroupTimelineParams = PaginationParams & WithMutedParam & OnlyMediaParam & LanguageParam;

/**
 * @category Request params
 */
type BubbleTimelineParams = PaginationParams & WithMutedParam & OnlyEventsParam & OnlyMediaParam & LanguageParam;

export type {
  PublicTimelineParams,
  HashtagTimelineParams,
  HomeTimelineParams,
  LinkTimelineParams,
  ListTimelineParams,
  GetConversationsParams,
  SaveMarkersParams,
  GroupTimelineParams,
  BubbleTimelineParams,
};
