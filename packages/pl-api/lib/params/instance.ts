/**
 * @category Request params
 */
interface ProfileDirectoryParams {
  /** Number. Skip the first n results. */
  offset?: number;
  /** Number. How many accounts to load. Defaults to 40 accounts. Max 80 accounts. */
  limit?: number;
  /** String. Use active to sort by most recently posted statuses (default) or new to sort by most recently created profiles. */
  order?: string;
  /** Boolean. If true, returns only local accounts. */
  local?: boolean;
}

export type {
  ProfileDirectoryParams,
};
