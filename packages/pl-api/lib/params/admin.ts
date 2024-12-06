import type { PaginationParams } from './common';

/**
 * @category Request params
 */
interface AdminGetAccountsParams extends PaginationParams {
  /** String. Filter for `local` or `remote` accounts. */
  origin?: 'local' | 'remote';
  /** String. Filter for `active`, `pending`, `disabled`, `silenced`, or suspended accounts. */
  status?: 'active' | 'pending' | 'disabled' | 'silenced' | 'suspended';
  /** String. Filter for accounts with `staff` permissions (users that can manage reports). */
  permissions?: 'staff';
  /** Array of String. Filter for users with these roles. */
  role_ids?: string[];
  /** String. Lookup users invited by the account with this ID. */
  invited_by?: string;
  /** String. Search for the given username. */
  username?: string;
  /** String. Search for the given display name */
  display_name?: string;
  /** String. Filter by the given domain */
  by_domain?: string;
  /** String. Lookup a user with this email */
  email?: string;
  /** String. Lookup users with this IP address */
  ip?: string;
}

/**
 * @category Request params
 */
type AdminAccountAction = 'none' | 'sensitive' | 'disable' | 'silence' | 'suspend';

/**
 * @category Request params
 */
interface AdminPerformAccountActionParams {
  /** String. The ID of an associated report that caused this action to be taken. */
  report_id?: string;
  /** String. The ID of a preset warning. */
  warning_preset_id?: string;
  /** String. Additional clarification for why this action was taken. */
  text?: string;
  /** Boolean. Should an email be sent to the user with the above information? */
  send_email_notification?: boolean;
}

/**
 * @category Request params
 */
type AdminGetDomainBlocksParams = PaginationParams;

/**
 * @category Request params
 */
interface AdminCreateDomainBlockParams {
  /** String. Whether to apply a `silence`, `suspend`, or `noop` to the domain. Defaults to `silence` */
  severity?: 'silence' | 'suspend' | 'noop';
  /** Boolean. Whether media attachments should be rejected. Defaults to false */
  reject_media?: boolean;
  /** Boolean. Whether reports from this domain should be rejected. Defaults to false */
  reject_reports?: boolean;
  /** String. A private note about this domain block, visible only to admins. */
  private_comment?: string;
  /** String. A public note about this domain block, optionally shown on the about page. */
  public_comment?: string;
  /** Boolean. Whether to partially censor the domain when shown in public. Defaults to false */
  obfuscate?: boolean;
}

/**
 * @category Request params
 */
type AdminUpdateDomainBlockParams = AdminCreateDomainBlockParams;

/**
 * @category Request params
 */
interface AdminGetReportsParams extends PaginationParams {
  /** Boolean. Filter for resolved reports? */
  resolved?: boolean;
  /** String. Filter for reports filed by this account. */
  account_id?: string;
  /** String. Filter for reports targeting this account. */
  target_account_id?: string;
}

/**
 * @category Request params
 */
interface AdminUpdateReportParams {
  /** String. Change the classification of the report to `spam`, `violation`, or `other`. */
  category?: 'spam' | 'violation' | 'other';
  /** Array of Integer. For `violation` category reports, specify the ID of the exact rules broken. Rules and their IDs are available via [GET /api/v1/instance/rules](https://docs.joinmastodon.org/methods/instance/#rules) and [GET /api/v1/instance](https://docs.joinmastodon.org/methods/instance/#get). */
  rule_ids?: string[];
}

/**
 * @category Request params
 */
interface AdminGetStatusesParams {
  limit?: number;
  local_only?: boolean;
  with_reblogs?: boolean;
  with_private?: boolean;
}

/**
 * @category Request params
 */
interface AdminUpdateStatusParams {
  sensitive?: boolean;
  visibility?: 'public' | 'private' | 'unlisted';
}

/**
 * @category Request params
 */
type AdminGetCanonicalEmailBlocks = PaginationParams;

/**
 * @category Request params
 */
type AdminDimensionKey = 'languages' | 'sources' | 'servers' | 'space_usage' | 'software_versions' | 'tag_servers' | 'tag_languages' | 'instance_accounts' | 'instance_languages';

/**
 * @category Request params
 */
interface AdminGetDimensionsParams {
  /** String (ISO 8601 Datetime). The start date for the time period. If a time is provided, it will be ignored. */
  start_at?: string;
  /** String (ISO 8601 Datetime). The end date for the time period. If a time is provided, it will be ignored. */
  end_at?: string;
  /** Integer. The maximum number of results to return for sources, servers, languages, tag or instance dimensions. */
  limit?: number;
  tag_servers?: {
    /** String. When tag_servers is one of the requested keys, you must provide a trending tag ID to obtain information about which servers are posting the tag. */
    id?: string;
  };
  tag_languages?: {
    /** String. When tag_languages is one of the requested keys, you must provide a trending tag ID to obtain information about which languages are posting the tag. */
    id?: string;
  };
  instance_accounts?: {
    /** String. When instance_accounts is one of the requested keys, you must provide a domain to obtain information about popular accounts from that server. */
    domain?: string;
  };
  instance_languages?: {
    /** String. When instance_accounts is one of the requested keys, you must provide a domain to obtain information about popular languages from that server. */
    domain?: string;
  };
}

/**
 * @category Request params
 */
type AdminGetDomainAllowsParams = PaginationParams;

/**
 * @category Request params
 */
type AdminGetEmailDomainBlocksParams = PaginationParams;

/**
 * @category Request params
 */
type AdminGetIpBlocksParams = PaginationParams;

/**
 * @category Request params
 */
interface AdminCreateIpBlockParams {
  /** String. The IP address and prefix to block. Defaults to 0.0.0.0/32 */
  ip?: string;
  /** String. The policy to apply to this IP range: sign_up_requires_approval, sign_up_block, or no_access */
  severity: string;
  /** String. The reason for this IP block. */
  comment?: string;
  /** Integer. The number of seconds in which this IP block will expire. */
  expires_in?: number;
}

/**
 * @category Request params
 */
type AdminUpdateIpBlockParams = Partial<AdminCreateIpBlockParams>;

/**
 * @category Request params
 */
type AdminMeasureKey = 'active_users' | 'new_users' | 'interactions' | 'opened_reports' | 'resolved_reports' | 'tag_accounts' | 'tag_uses' | 'tag_servers' | 'instance_accounts' | 'instance_media_attachments' | 'instance_reports' | 'instance_statuses' | 'instance_follows' | 'instance_followers';

/**
 * @category Request params
 */
interface AdminGetMeasuresParams {
  tag_accounts?: {
    /** String. When `tag_accounts` is one of the requested keys, you must provide a tag ID to obtain the measure of how many accounts used that hashtag in at least one status within the given time period. */
    id?: string;
  };
  tag_uses?: {
    /** String. When `tag_uses` is one of the requested keys, you must provide a tag ID to obtain the measure of how many statuses used that hashtag within the given time period. */
    id?: string;
  };
  tag_servers?: {
    /** String. When `tag_servers` is one of the requested keys, you must provide a tag ID to obtain the measure of how many servers used that hashtag in at least one status within the given time period. */
    id?: string;
  };
  instance_accounts?: {
    /** String. When `instance_accounts` is one of the requested keys, you must provide a remote domain to obtain the measure of how many accounts have been discovered from that server within the given time period. */
    domain?: string;
  };
  instance_media_attachments?: {
    /** String. When `instance_media_attachments` is one of the requested keys, you must provide a remote domain to obtain the measure of how much space is used by media attachments from that server within the given time period. */
    domain?: string;
  };
  instance_reports?: {
    /** String. When `instance_reports` is one of the requested keys, you must provide a remote domain to obtain the measure of how many reports have been filed against accounts from that server within the given time period. */
    domain?: string;
  };
  instance_statuses?: {
    /** String. When `instance_statuses` is one of the requested keys, you must provide a remote domain to obtain the measure of how many statuses originate from that server within the given time period. */
    domain?: string;
  };
  instance_follows?: {
    /** String. When `instance_follows` is one of the requested keys, you must provide a remote domain to obtain the measure of how many follows were performed on accounts from that server by local accounts within the given time period. */
    domain?: string;
  };
  instance_followers?: {
    /** String. When `instance_followers` is one of the requested keys, you must provide a remote domain to obtain the measure of how many follows were performed by accounts from that server on local accounts within the given time period. */
    domain?: string;
  };
}

/**
 * @category Request params
 */
interface AdminGetAnnouncementsParams {
  offset?: number;
  limit?: number;
}

/**
 * @category Request params
 */
interface AdminCreateAnnouncementParams {
  /** announcement content */
  content: string;
  /** datetime, optional, default to null, the time when the announcement will become active (displayed to users); if it is null, the announcement will be active immediately */
  starts_at?: string;
  /** datetime, optional, default to null, the time when the announcement will become inactive (no longer displayed to users); if it is null, the announcement will be active until an admin deletes it */
  ends_at?: string;
  /** boolean, optional, default to false, tells the client whether to only display dates for `starts_at` and `ends_at` */
  all_day?: boolean;
}

/**
 * @category Request params
 */
type AdminUpdateAnnouncementParams = Partial<AdminCreateAnnouncementParams>;

/**
 * @category Request params
 */
interface AdminCreateDomainParams {
  /** domain name */
  domain: string;
  /** defaults to false, whether it is possible to register an account under the domain by everyone */
  public?: boolean;
}

/**
 * @category Request params
 */
interface AdminGetModerationLogParams extends Pick<PaginationParams, 'limit'> {
  /** page number */
  page?: number;
  /** datetime (ISO 8601) filter logs by creation date, start from start_date. Accepts datetime in ISO 8601 format (YYYY-MM-DDThh:mm:ss), e.g. 2005-08-09T18:31:42 */
  start_date?: string;
  /** datetime (ISO 8601) filter logs by creation date, end by from end_date. Accepts datetime in ISO 8601 format (YYYY-MM-DDThh:mm:ss), e.g. 2005-08-09T18:31:42 */
  end_date?: string;
  /** filter logs by actor's id */
  user_id?: string;
  /** search logs by the log message */
  search?: string;
}

/**
 * @category Request params
 */
interface AdminCreateRuleParams {
  text: string;
  hint?: string;
  priority?: number;
}

/**
 * @category Request params
 */
type AdminUpdateRuleParams = Partial<AdminCreateRuleParams>;

/**
 * @category Request params
 */
interface AdminGetGroupsParams {
}

export type {
  AdminGetAccountsParams,
  AdminAccountAction,
  AdminPerformAccountActionParams,
  AdminGetDomainBlocksParams,
  AdminCreateDomainBlockParams,
  AdminUpdateDomainBlockParams,
  AdminGetReportsParams,
  AdminUpdateReportParams,
  AdminGetStatusesParams,
  AdminUpdateStatusParams,
  AdminGetCanonicalEmailBlocks,
  AdminDimensionKey,
  AdminGetDimensionsParams,
  AdminGetDomainAllowsParams,
  AdminGetEmailDomainBlocksParams,
  AdminGetIpBlocksParams,
  AdminCreateIpBlockParams,
  AdminUpdateIpBlockParams,
  AdminMeasureKey,
  AdminGetMeasuresParams,
  AdminGetAnnouncementsParams,
  AdminCreateAnnouncementParams,
  AdminUpdateAnnouncementParams,
  AdminCreateDomainParams,
  AdminGetModerationLogParams,
  AdminCreateRuleParams,
  AdminUpdateRuleParams,
  AdminGetGroupsParams,
};
