import { UpdateInteractionPoliciesParams } from './settings';

import type { PaginationParams } from './common';

/**
 * @category Request params
 */
interface CreateStatusWithContent {
  /** The text content of the status. If `media_ids` is provided, this becomes optional. Attaching a `poll` is optional while `status` is provided. */
  status: string;
  /** Array of String. Include Attachment IDs to be attached as media. If provided, `status` becomes optional, and `poll` cannot be used. */
  media_ids?: string[];
}

/**
 * @category Request params
 */
interface CreateStatusWithMedia {
  /** The text content of the status. If `media_ids` is provided, this becomes optional. Attaching a `poll` is optional while `status` is provided. */
  status?: string;
  /** Array of String. Include Attachment IDs to be attached as media. If provided, `status` becomes optional, and `poll` cannot be used. */
  media_ids: string[];
}

/**
 * @category Request params
 */
interface CreateStatusOptionalParams {
  poll?: {
    /** Array of String. Possible answers to the poll. If provided, `media_ids` cannot be used, and poll[expires_in] must be provided. */
    options: string[];
    /** Integer. Duration that the poll should be open, in seconds. If provided, media_ids cannot be used, and poll[options] must be provided. */
    expires_in: number;
    /** Boolean. Allow multiple choices? Defaults to false. */
    multiple?: boolean;
    /** Boolean. Hide vote counts until the poll ends? Defaults to false. */
    hide_totals?: boolean;

    options_map?: Array<Record<string, string>>;
  };
  /** String. ID of the status being replied to, if status is a reply. */
  in_reply_to_id?: string;
  /** Boolean. Mark status and attached media as sensitive? Defaults to false. */
  sensitive?: boolean;
  /** String. Text to be shown as a warning or subject before the actual content. Statuses are generally collapsed behind this field. */
  spoiler_text?: string;
  /**
   * String. Sets the visibility of the posted status to `public`, `unlisted`, `private`, `direct`.
   * `local` — Requires features{@link Features['createStatusLocalScope']}.
   * `mutuals_only` — Requires features{@link Features['createStatusMutualsOnlyScope']}.
   * `subscribers` — Requires features{@link Features['createStatusSubscribersScope']}.
   * `list:LIST_ID` — Requires features{@link Features['createStatusListScope']}.
   * `circle:LIST_ID` — Requires features{@link Features['circles']}.
   */
  visibility?: string;
  /** String. ISO 639 language code for this status. */
  language?: string;
  /** String. ISO 8601 Datetime at which to schedule a status. Providing this parameter will cause ScheduledStatus to be returned instead of Status. Must be at least 5 minutes in the future. */
  scheduled_at?: string;

  /**
   * boolean, if set to true the post won't be actually posted, but the status entity would still be rendered back. This could be useful for previewing rich text/custom emoji, for example.
   * Requires features{@link Features['createStatusPreview']}.
   */
  preview?: boolean;
  /**
   * string, contain the MIME type of the status, it is transformed into HTML by the backend. You can get the list of the supported MIME types with the `/api/v1/instance` endpoint.
   */
  content_type?: string;
  /**
   * A list of nicknames (like `lain@soykaf.club` or `lain` on the local server) that will be used to determine who is going to be addressed by this post. Using this will disable the implicit addressing by mentioned names in the `status` body, only the people in the `to` list will be addressed. The normal rules for post visibility are not affected by this and will still apply.
   * Requires features{@link Features['createStatusExplicitAddressing']}.
  */
  to?: string[];
  /**
   * The number of seconds the posted activity should expire in. When a posted activity expires it will be deleted from the server, and a delete request for it will be federated. This needs to be longer than an hour.
   * Requires features{@link Features['createStatusExpiration']}.
   */
  expires_in?: number;
  /**
   * Will reply to a given conversation, addressing only the people who are part of the recipient set of that conversation. Sets the visibility to `direct`.
   * Requires features{@link Features['createStatusReplyToConversation']}.
   */
  in_reply_to_conversation_id?: string;
  /**
   * ID of the status being quoted, if any.
   * Requires features{@link Features['quotePosts']}.
   */
  quote_id?: string;

  /**
   * If set to true, this status will be "local only" and will NOT be federated beyond the local timeline(s). If set to false (default), this status will be federated to your followers beyond the local timeline(s).
   */
  local_only?: boolean;

  group_id?: string;

  status_map?: Record<string, string>;
  spoiler_text_map?: Record<string, string>;

  /** The 'interaction_policy' field can be used to set an interaction policy for this status. */
  interaction_policy?: UpdateInteractionPoliciesParams['public'];
}

/**
 * @category Request params
 */
type CreateStatusParams = (CreateStatusWithContent | CreateStatusWithMedia) & CreateStatusOptionalParams;

/**
 * @category Request params
 */
interface LanguageParam {
  /** Attach translated version of a post. Requires features{@link Features['autoTranslate']}. */
  language?: string;
}

/**
 * @category Request params
 */
type GetStatusParams = LanguageParam;

/**
 * @category Request params
 */
type GetStatusesParams = LanguageParam;

/**
 * @category Request params
 */
type GetStatusContextParams = LanguageParam;

/**
 * @category Request params
 */
type GetRebloggedByParams = Omit<PaginationParams, 'min_id'>

/**
 * @category Request params
 */
type GetFavouritedByParams = Omit<PaginationParams, 'min_id'>

/**
 * @category Request params
 */
type EditStatusOptionalParams = Pick<CreateStatusOptionalParams, 'content_type' | 'sensitive' | 'spoiler_text' | 'language'>;

/**
 * @category Request params
 */
type EditStatusParams = (CreateStatusWithContent | CreateStatusWithMedia) & EditStatusOptionalParams;

/**
 * @category Request params
 */
type GetStatusQuotesParams = PaginationParams;

/**
 * @category Request params
 */
type GetStatusReferencesParams = PaginationParams;

/**
 * @category Request params
 */
type GetStatusMentionedUsersParams = PaginationParams;

export type {
  CreateStatusParams,
  GetStatusParams,
  GetStatusesParams,
  GetStatusContextParams,
  GetRebloggedByParams,
  GetFavouritedByParams,
  EditStatusParams,
  GetStatusQuotesParams,
  GetStatusReferencesParams,
  GetStatusMentionedUsersParams,
};

