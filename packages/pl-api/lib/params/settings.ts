/**
 * @category Request params
 */
interface CreateAccountParams {
  /** String. The desired username for the account */
  username: string;
  /** String. The email address to be used for login */
  email: string;
  /** String. The password to be used for login */
  password: string;
  /** Whether the user agrees to the local rules, terms, and policies. These should be presented to the user in order to allow them to consent before setting this parameter to TRUE. */
  agreement: boolean;
  /** String. The language of the confirmation email that will be sent. */
  locale: string;
  /** String. If registrations require manual approval, this text will be reviewed by moderators. */
  reason?: string;

  fullname?: string;
  bio?: string;
  /** optional, contains provider-specific captcha solution */
  captcha_solution?: string;
  /** optional, contains provider-specific captcha token */
  captcha_token?: string;
  /** optional, contains provider-specific captcha data */
  captcha_answer_data?: string;
  /** invite token required when the registrations aren't public. */
  token?: string;
  birthday?: string;

  /** optional, domain id, if multitenancy is enabled. */
  domain?: string;

  accepts_email_list?: boolean;
}

/**
 * @category Request params
 */
interface UpdateCredentialsParams {
  /** String. The display name to use for the profile. */
  display_name?: string;
  /** String. The account bio. */
  note?: string;
  /** Avatar image encoded using `multipart/form-data` */
  avatar?: File | '';
  /** Header image encoded using `multipart/form-data` */
  header?: File | '';
  /** Boolean. Whether manual approval of follow requests is required. */
  locked?: boolean;
  /** Boolean. Whether the account has a bot flag. */
  bot?: boolean;
  /** Boolean. Whether the account should be shown in the profile directory. */
  discoverable?: boolean;
  /** Boolean. Whether to hide followers and followed accounts. */
  hide_collections?: boolean;
  /** Boolean. Whether public posts should be searchable to anyone. */
  indexable?: boolean;
  /** Hash. The profile fields to be set. Inside this hash, the key is an integer cast to a string (although the exact integer does not matter), and the value is another hash including name and value. By default, max 4 fields. */
  fields_attributes?: Array<{
    /** String. The name of the profile field. By default, max 255 characters. */
    name: string;
    /** String. The value of the profile field. By default, max 255 characters. */
    value: string;
  }>;
  source?: {
    /** String. Default post privacy for authored statuses. Can be public, unlisted, or private. */
    privacy?: string;
    /** Boolean. Whether to mark authored statuses as sensitive by default. */
    sensitive?: string;
    /** String. Default language to use for authored statuses (ISO 6391) */
    language?: string;
  };

  /** if true, html tags are stripped from all statuses requested from the API */
  no_rich_text?: boolean;
  /** if true, user's followers will be hidden*/
  hide_followers?: boolean;
  /** if true, user's follows will be hidden */
  hide_follows?: boolean;
  /** if true, user's follower count will be hidden */
  hide_followers_count?: boolean;
  /** if true, user's follow count will be hidden */
  hide_follows_count?: boolean;
  /** if true, user's favorites timeline will be hidden */
  hide_favorites?: boolean;
  /** if true, user's role (e.g admin, moderator) will be exposed to anyone in the API */
  show_role?: boolean;
  /** the scope returned under privacy key in Source subentity */
  default_scope?: string;
  /** Opaque user settings to be saved on the backend. */
  settings_store?: Record<string, any>;
  /** if true, skip filtering out broken threads */
  skip_thread_containment?: boolean;
  /** if true, allows automatically follow moved following accounts */
  allow_following_move?: boolean;
  /** array of ActivityPub IDs, needed for following move */
  also_known_as?: string[];
  /** sets the background image of the user. Can be set to "" (an empty string) to reset. */
  background_image?: string;
  /** the type of this account. */
  actor_type?: string;
  /** if false, this account will reject all chat messages. */
  accepts_chat_messages?: boolean;
  /** user's preferred language for receiving emails (digest, confirmation, etc.) */
  language?: string;

  /**
   * Description of avatar image, for alt-text.
   * Requires `features.accountAvatarDescription`.
   */
  avatar_description?: boolean;
  /**
   * Description of header image, for alt-text.
   * Requires `features.accountAvatarDescription`.
   */
  header_description?: boolean;
  /**
   * Enable RSS feed for this account's Public posts at `/[username]/feed.rss`
   * Requires `features.accountEnableRss`.
  */
  enable_rss?: boolean;
}

/**
 * @category Request params
 */
interface UpdateNotificationSettingsParams {
  /**
   * blocks notifications from accounts you do not follow
   */
  block_from_strangers?: boolean;

  /**
   * When set to true, it removes the contents of a message from the push notification.
   */
  hide_notification_contents?: boolean;
}

/**
 * @category Request params
 */
type UpdateInteractionPoliciesParams = Record<
  'public' | 'unlisted' | 'private' | 'direct',
  Record<
    'can_favourite' | 'can_reblog' | 'can_reply',
    Record<
      'always' | 'with_approval',
      Array<'public' | 'followers' | 'following' | 'mutuals' | 'mentioned' | 'author' | 'me' | string>
    >
  >
>;

export type {
  CreateAccountParams,
  UpdateCredentialsParams,
  UpdateNotificationSettingsParams,
  UpdateInteractionPoliciesParams,
};
