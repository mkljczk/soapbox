interface PaginationParams {
  /** String. All results returned will be lesser than this ID. In effect, sets an upper bound on results. */
  max_id?: string;
  /** String. All results returned will be greater than this ID. In effect, sets a lower bound on results. */
  since_id?: string;
  /** Integer. Maximum number of results to return. */
  limit?: number;
  /** String. Returns results immediately newer than this ID. In effect, sets a cursor at this ID and paginates forward. */
  min_id?: string;
}

interface WithMutedParam {
  /**
   * Boolean. Also show statuses from muted users. Default to false.
   *
   * Requires features{@link Features['timelinesWithMuted']}.
   */
  with_muted?: boolean;
}

interface WithRelationshipsParam {
  /**
   * Embed relationships into accounts.
   * Supported by Pleroma.
   */
  with_relationships?: boolean;
}

interface OnlyMediaParam {
  /** Boolean. Show only statuses with media attached? Defaults to false. */
  only_media?: boolean;
}

interface OnlyEventsParam {
  /**
   * Boolean. Filter out statuses without events.
   *
   * Requires features{@link Features['events']}.
   */
  only_events?: boolean;
}

interface LanguageParam {
  /**
   * Fetch a translation in given language
   *
   * Requires features{@link Features['fetchStatusesWithTranslation']}.
   */
  language?: string;
}

export type {
  PaginationParams,
  WithMutedParam,
  WithRelationshipsParam,
  OnlyMediaParam,
  OnlyEventsParam,
  LanguageParam,
};
