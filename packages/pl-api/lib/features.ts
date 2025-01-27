import semverCoerce from 'semver/functions/coerce';
import gte from 'semver/functions/gte';
import semverParse from 'semver/functions/parse';

import type { Instance } from './entities/instance';

/** Truthy array convenience function */
const any = (arr: Array<any>): boolean => arr.some(Boolean);

/**
 * Ditto, a Nostr server with Mastodon API.
 *
 * @category Software
 * @see {@link https://gitlab.com/soapbox-pub/ditto}
 */
const DITTO = 'Ditto';

/**
 * Firefish, a fork of Misskey. Formerly known as Calckey.
 *
 * @category Software
 * @see {@link https://joinfirefish.org/}
 */
const FIREFISH = 'Firefish';

/**
 * Friendica, decentralized social platform implementing multiple federation protocols.
 *
 * @category Software
 * @see {@link https://friendi.ca/}
 */
const FRIENDICA = 'Friendica';

/**
 * GoToSocial, an ActivityPub server written in Golang.
 *
 * @category Software
 * @see {@link https://gotosocial.org/}
 */
const GOTOSOCIAL = 'GoToSocial';

/**
 * Iceshrimp, yet another Misskey fork.
 *
 * @category Software
 * @see {@link https://iceshrimp.dev/}
 */
const ICESHRIMP = 'Iceshrimp';

/**
 * Iceshrimp.NET, a decentralized and federated social networking service, powered by .NET.
 *
 * @category Software
 * @see {@link https://iceshrimp.dev/}
 */
const ICESHRIMP_NET = 'Iceshrimp.NET';

/**
 * Mastodon, the software upon which this is all based.
 *
 * @category Software
 * @see {@link https://joinmastodon.org/}
 */
const MASTODON = 'Mastodon';

/**
 * Mitra, a Rust backend with cryptocurrency integrations.
 *
 * @category Software
 * @see {@link https://codeberg.org/silverpill/mitra}
 */
const MITRA = 'Mitra';

/**
 * Pixelfed, a federated image sharing platform.
 *
 * @category Software
 * @see {@link https://pixelfed.org/}
 */
const PIXELFED = 'Pixelfed';

/**
 * Pleroma, a feature-rich alternative written in Elixir.
 *
 * @category Software
 * @see {@link https://pleroma.social/}
 */
const PLEROMA = 'Pleroma';

/**
 * Takahē, backend with support for serving multiple domains.
 *
 * @category Software
 * @see {@link https://jointakahe.org/}
 */
const TAKAHE = 'Takahe';

/**
 * Toki, a C# Fediverse server.
 *
 * @category Software
 * @see {@link https://github.com/purifetchi/Toki}
 */
const TOKI = 'Toki';

/**
 * WordPress, through the Enable Mastodon App plugin.
 * I am not affiliated with WP Engine in any way, finanically or otherwise. ~mkljczk
 *
 * @category Software
 * @see {@link https://github.com/akirk/enable-mastodon-apps}
 */
const WORDPRESS = 'WordPress';

/**
 * Akkoma, a Pleroma fork.
 *
 * @category Software
 * @see {@link https://akkoma.dev/AkkomaGang/akkoma}
 */
const AKKOMA = 'akkoma';

/**
 * glitch-soc, fork of Mastodon with a number of experimental features.
 *
 * @category Software
 * @see {@link https://glitch-soc.github.io/docs/}
 */
const GLITCH = 'glitch';

/**
 * glitch-soc, fork of Mastodon that provides local posting and a wider range of content types.
 *
 * @category Software
 * @see {@link https://github.com/hometown-fork/hometown}
 */
const HOMETOWN = 'hometown';

/**
 * Pl, fork of Pleroma developed by pl-api author.
 *
 * @category Software
 * @see {@link https://github.com/mkljczk/pl}
 */
const PL = 'pl';

/**
 * Rebased, fork of Pleroma developed by Soapbox author.
 *
 * @category Software
 * @see {@link https://gitlab.com/soapbox-pub/rebased}
 */
const REBASED = 'soapbox';

/**
 * Backend name reserved only for tests.
 *
 * @category Software
 */
const UNRELEASED = 'unreleased';

/**
 * Parse features for the given instance
 * @category Utils
 */
const getFeatures = (instance: Instance) => {
  const v = parseVersion(instance.version || '');
  const federation = !!instance.pleroma.metadata.federation.enabled;

  return {
    version: v,

    /**
     * Ability to set description of profile avatar and header.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountAvatarDescription: any([
      v.software === GOTOSOCIAL && gte(v.version, '0.17.0'),
      v.software === PLEROMA && v.build === PL,
    ]),

    /**
     * Pleroma backups.
     * @see GET /api/v1/pleroma/backups
     * @see POST /api/v1/pleroma/backups
     */
    accountBackups: v.software === PLEROMA,

    /**
     * The accounts API allows an acct instead of an ID.
     * @see GET /api/v1/accounts/:acct_or_id
     */
    accountByUsername: v.software === PLEROMA,

    /**
     * Ability to create accounts.
     * @see POST /api/v1/accounts
     */
    accountCreation: true,

    /**
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountEnableRss: v.software === GOTOSOCIAL,

    /**
     * Ability to pin other accounts on one's profile.
     * @see POST /api/v1/accounts/:id/pin
     * @see POST /api/v1/accounts/:id/unpin
     * @see GET /api/v1/pleroma/accounts/:id/endorsements
     */
    accountEndorsements: v.software === PLEROMA && gte(v.version, '2.5.0'),

    /**
     * Ability to set one's location on their profile.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountLocation: any([
      v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.5.0'),
      v.software === PLEROMA && v.build === PL,
    ]),

    /**
     * Look up an account by the acct.
     * @see GET /api/v1/accounts/lookup
     */
    accountLookup: any([
      v.software === DITTO,
      v.software === FIREFISH,
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PLEROMA && gte(v.version, '2.5.0'),
      v.software === TAKAHE && gte(v.version, '0.6.1'),
      v.software === TOKI,
      v.software === WORDPRESS,
    ]),

    /**
     * Move followers to a different ActivityPub account.
     * @see POST /api/pleroma/move_account
     */
    accountMoving: v.software === PLEROMA && gte(v.version, '2.5.0'),

    /**
     * Ability to subscribe to notifications every time an account posts.
     * @see POST /api/v1/accounts/:id/follow
     */
    accountNotifies: any([
      v.software === MASTODON,
      v.software === PLEROMA && gte(v.version, '2.5.0'),
      v.software === GOTOSOCIAL,
    ]),

    /**
     * Ability to address a status to a list of users.
     * @see POST /api/v1/statuses
     */
    addressableLists: v.software === PLEROMA && gte(v.version, '1.0.2'),

    /**
     * Can display announcements set by admins.
     * @see GET /api/v1/announcements
     * @see POST /api/v1/announcements/:id/dismiss
     * @see {@link https://docs.joinmastodon.org/methods/announcements/}
     */
    announcements: any([
      v.software === FIREFISH,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === PLEROMA,
      v.software === TAKAHE && gte(v.version, '0.7.0'),
    ]),

    /**
     * Can emoji react to announcements set by admins.
     * @see PUT /api/v1/announcements/:id/reactions/:name
     * @see DELETE /api/v1/announcements/:id/reactions/:name
     * @see {@link https://docs.joinmastodon.org/methods/announcements/}
     */
    announcementsReactions: v.software === MASTODON,

    kmyblue_antenna: instance.api_versions['kmyblue_antenna.fedibird.pl-api'] >= 1,

    /**
     * Set your birthday and view upcoming birthdays.
     * @see GET /api/v1/pleroma/birthdays
     * @see POST /api/v1/accounts
     * @see PATCH /api/v1/accounts/update_credentials
     */
    birthdays: v.software === PLEROMA,

    /**
     * Allow to bite users.
     * see POST /api/v1/bite
     */
    bites: any([
      v.software === ICESHRIMP_NET,
      v.software === TOKI,
      instance.api_versions['bites.pleroma.pl-api'] >= 1,
    ]),

    /** Whether people who blocked you are visible through the API. */
    blockersVisible: instance.api_versions['blockers_visible.pleroma.pl-api'] >= 1,

    /**
     * Can group bookmarks in folders.
     * @see GET /api/v1/pleroma/bookmark_folders
     * @see POST /api/v1/pleroma/bookmark_folders
     * @see PATCH /api/v1/pleroma/bookmark_folders/:id
     * @see DELETE /api/v1/pleroma/bookmark_folders/:id
     */
    bookmarkFolders: instance.api_versions['bookmark_folders.pleroma.pl-api'] >= 1,

    /**
     * Can bookmark statuses.
     * @see POST /api/v1/statuses/:id/bookmark
     * @see GET /api/v1/bookmarks
     */
    bookmarks: any([
      v.software === DITTO,
      v.software === FIREFISH,
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === FRIENDICA,
      v.software === MASTODON,
      v.software === MITRA && gte(v.version, '3.3.0'),
      v.software === PIXELFED,
      v.software === PLEROMA,
      v.software === TAKAHE && gte(v.version, '0.9.0'),
      v.software === TOKI,
    ]),

    /**
     * Accounts can be marked as bots.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    bots: any([
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === PLEROMA,
    ]),

    /**
     * Can display a timeline of statuses from instances selected by instance admin.
     * @see GET /api/v1/timelines/bubble
     */
    bubbleTimeline: instance.api_versions['bubble_timeline.pleroma.pl-api'] >= 1,

    /**
     * Pleroma chats API.
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/}
     */
    chats: instance.api_versions['chat_messages.pleroma.pl-api'] >= 1,

    /**
     * Ability to delete a chat.
     * @see DELETE /api/v1/pleroma/chats/:id
     */
    chatsDelete: any([
      v.build === REBASED,
      v.software === PLEROMA && v.build === PL,
    ]),

    circles: instance.api_versions['kmyblue_circle_history.fedibird.pl-api'] >= 1,

    /**
     * Mastodon's newer solution for direct messaging.
     * @see {@link https://docs.joinmastodon.org/methods/conversations/}
     */
    conversations: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === GOTOSOCIAL && gte(v.version, '0.17.0'),
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === PIXELFED,
      v.software === PLEROMA,
      v.software === TAKAHE,
    ]),

    /**
     * @see GET /api/v1/conversations
     */
    conversationsByRecipients: v.software === PLEROMA,

    /**
     * @see POST /api/v1/statuses
     */
    createStatusExpiration: v.software === PLEROMA,

    /**
     * Ability to address recipients of a status explicitly (with `to`).
     * @see POST /api/v1/statuses
     */
    createStatusExplicitAddressing: any([
      v.software === DITTO,
      instance.api_versions['explicit_addressing.pleroma.pl-api'] >= 1,
    ]),

    /**
     * @see POST /api/v1/statuses
     */
    createStatusReplyToConversation: v.software === PLEROMA,

    /**
     * Ability to address a status to a list of users.
     * @see POST /api/v1/statuses
     */
    createStatusListScope: v.software === PLEROMA,

    /**
     * @see POST /api/v1/statuses
     */
    createStatusLocalScope: any([
      v.software === ICESHRIMP_NET,
      v.software === PLEROMA,
    ]),

    /**
     * Ability to post statuses only to accounts with mutual relationship.
     * @see POST /api/v1/statuses
     */
    createStatusMutualsOnlyScope: v.software === GOTOSOCIAL,

    /**
     * Ability to post statuses only to your subscribers.
     * @see POST /api/v1/statuses
     */
    createStatusSubscribersScope: v.software === MITRA,

    /**
     * @see POST /api/v1/statuses
     */
    createStatusPreview: v.software === PLEROMA,

    /**
     * Ability to add non-standard reactions to a status.
     */
    customEmojiReacts: any([
      instance.api_versions['custom_emoji_reactions.pleroma.pl-api'] >= 1,
      v.software === MITRA && gte(v.version, '3.4.0'),
    ]),

    /**
     * @see POST /api/v1/accounts/delete
     * @see POST /api/pleroma/delete_account
     */
    deleteAccount: any([
      v.software === GOTOSOCIAL,
      v.software === PLEROMA,
    ]),

    /**
     * Allow to register on a given domain
     * @see GET /api/v1/pleroma/admin/domains
     * @see POST /api/v1/pleroma/admin/domains
     * @see PATCH /api/v1/pleroma/admin/domains/:id
     * @see DELETE /api/v1/pleroma/admin/domains/:id
     */
    domains: any([instance.pleroma.metadata.multitenancy.enabled]),

    /**
     * Ability to edit profile information.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    editProfile: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PIXELFED,
      v.software === PLEROMA,
      v.software === TAKAHE && gte(v.version, '0.7.0'),
      v.software === TOKI,
    ]),

    /**
     * Ability to edit published posts.
     * @see PUT /api/v1/statuses/:id
     */
    editStatuses: any([
      v.software === FIREFISH,
      v.software === FRIENDICA && gte(v.version, '2022.12.0'),
      v.software === GOTOSOCIAL && gte(v.version, '0.17.4'),
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === TAKAHE && gte(v.version, '0.8.0'),
      instance.api_versions['editing.pleroma.pl-api'] >= 1,
    ]),

    /**
     * Soapbox email list.
     * @see POST /api/v1/accounts
     * @see PATCH /api/v1/accounts/update_credentials
     * @see GET /api/v1/pleroma/admin/email_list/subscribers.csv
     * @see GET /api/v1/pleroma/admin/email_list/unsubscribers.csv
     * @see GET /api/v1/pleroma/admin/email_list/combined.csv
     */
    emailList: instance.api_versions['email_list.pleroma.pl-api'] >= 1,

    /**
     * Ability to embed posts on external sites.
     * @see GET /api/oembed
     */
    embeds: v.software === MASTODON,

    /**
     * Ability to add emoji reactions to a status.
     * @see PUT /api/v1/pleroma/statuses/:id/reactions/:emoji
     * @see DELETE /api/v1/pleroma/statuses/:id/reactions/:emoji
     *
     * @see POST /v1/statuses/:id/react/:emoji
     * @see POST /v1/statuses/:id/unreact/:emoji
     */
    emojiReacts: any([
      v.software === FIREFISH,
      v.software === MITRA && gte(v.version, '2.21.0'),
      v.software === PLEROMA,
      instance ? instance.configuration.reactions.max_reactions > 0 : false,
    ]),

    /**
     * @see GET /api/v1/pleroma/statuses/:id/reactions/:emoji?
     *
     * @see GET /api/v1/statuses/:id/emoji_reactioned_by
     */
    emojiReactsList: any([
      v.software === PLEROMA,
      instance.api_versions['emoji_reaction.fedibird.pl-api'] >= 1,
    ]),

    /**
     * Ability to create and perform actions on events.
     * @see POST /api/v1/pleroma/events
     * @see GET /api/v1/pleroma/events/joined_events
     * @see PUT /api/v1/pleroma/events/:id
     * @see GET /api/v1/pleroma/events/:id/participations
     * @see GET /api/v1/pleroma/events/:id/participation_requests
     * @see POST /api/v1/pleroma/events/:id/participation_requests/:participant_id/authorize
     * @see POST /api/v1/pleroma/events/:id/participation_requests/:participant_id/reject
     * @see POST /api/v1/pleroma/events/:id/join
     * @see POST /api/v1/pleroma/events/:id/leave
     * @see GET /api/v1/pleroma/events/:id/ics
     * @see GET /api/v1/pleroma/search/location
     */
    events: instance.api_versions['events.pleroma.pl-api'] >= 1,

    /** Whether to allow exporting follows/blocks/mutes to CSV by paginating the API. */
    exportData: true,

    /** Whether the accounts who favourited or emoji-reacted to a status can be viewed through the API. */
    exposableReactions: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === TAKAHE && gte(v.version, '0.6.1'),
      v.software === TOKI,
      instance.api_versions['exposable_reactions.pleroma.pl-api'] >= 1,
    ]),

    /**
     * Can see accounts' followers you know
     * @see GET /api/v1/accounts/familiar_followers
     */
    familiarFollowers: any([
      v.software === DITTO,
      v.software === MASTODON,
      v.software === PIXELFED,
      v.software === PLEROMA && gte(v.version, '2.6.0') && v.build === REBASED,
      v.software === PLEROMA && gte(v.version, '2.7.0'),
      v.software === TAKAHE,
    ]),

    /**
     * @see GET /api/v1/accounts/:accountId/featured_tags
     * @see GET /api/v1/featured_tags
     * @see POST /api/v1/featured_tags
     * @see DELETE /api/v1/featured_tags
     * @see GET /api/v1/featured_tags/suggestions
     */
    featuredTags: v.software === MASTODON,

    /** Whether the instance federates. */
    federating: federation,

    /**
     * Can edit and manage timeline filters (aka "muted words").
     * @see {@link https://docs.joinmastodon.org/methods/filters/#v1}
     */
    filters: any([
      v.software === GOTOSOCIAL,
      v.software === PLEROMA,
    ]),

    /**
     * Can edit and manage timeline filters (aka "muted words").
     * @see {@link https://docs.joinmastodon.org/methods/filters/}
     */
    filtersV2: any([
      v.software === GOTOSOCIAL && gte(v.version, '0.16.0'),
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
    ]),

    /**
     * Allows setting the focal point of a media attachment.
     * @see {@link https://docs.joinmastodon.org/methods/media/}
     */
    focalPoint: any([
      v.software === GOTOSOCIAL,
      v.software === MASTODON,
    ]),

    /**
     * TODO
     */
    // followAccountLanguages: any([]),

    /**
     * Ability to list followed hashtags.
     * @see GET /api/v1/followed_tags
     */
    followedHashtagsList: any([
      v.software === GOTOSOCIAL && gte(v.version, '0.17.0'),
      v.software === MASTODON && gte(v.compatVersion, '4.1.0'),
      v.software === PIXELFED,
      v.software === PLEROMA && v.build === AKKOMA,
      v.software === PLEROMA && v.build === PL,
      v.software === TAKAHE && gte(v.version, '0.9.0'),
    ]),

    /**
     * Ability to follow hashtags.
     * @see POST /api/v1/tags/:name/follow
     * @see POST /api/v1/tags/:name/unfollow
     */
    followHashtags: any([
      v.software === GOTOSOCIAL && gte(v.version, '0.17.0'),
      v.software === MASTODON && gte(v.compatVersion, '4.0.0'),
      v.software === PIXELFED,
      v.software === PLEROMA && v.build === AKKOMA,
      v.software === PLEROMA && v.build === PL,
      v.software === TAKAHE && gte(v.version, '0.9.0'),
    ]),

    /**
     * Ability to lock accounts and manually approve followers.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    followRequests: any([
      v.software === FIREFISH,
      v.software === GOTOSOCIAL,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PLEROMA,
      v.software === TOKI,
    ]),

    /**
     * Whether client settings can be retrieved from the API.
     * @see GET /api/pleroma/frontend_configurations
     */
    frontendConfigurations: any([
      v.software === DITTO,
      v.software === ICESHRIMP_NET,
      v.software === PLEROMA,
    ]),

    /**
     * @see GET /api/v2/notifications/:group_key
     * @see GET /api/v2/notifications/:group_key
     * @see POST /api/v2/notifications/:group_key/dismiss
     * @see GET /api/v2/notifications/:group_key/accounts
     * @see GET /api/v2/notifications/unread_count
     */
    groupedNotifications: instance.api_versions.mastodon >= 2,

    /**
     * Groups.
     * @see POST /api/v1/groups
     * @see GET /api/v1/groups
     * @see GET /api/v1/groups/:id
     * @see POST /api/v1/groups/:id/join
     * @see POST /api/v1/groups/:id/leave
     * @see GET /api/v1/groups/:id/memberships
     * @see PUT /api/v1/groups/:group_id
     * @see DELETE /api/v1/groups/:group_id
     * @see GET /api/v1/groups/:group_id/membership_requests
     * @see POST /api/v1/groups/:group_id/membership_requests/:account_id/authorize
     * @see POST /api/v1/groups/:group_id/membership_requests/:account_id/reject
     * @see DELETE /api/v1/groups/:group_id/statuses/:id
     * @see POST /api/v1/groups/:group_id/kick?account_ids[]=…
     * @see GET /api/v1/groups/:group_id/blocks
     * @see POST /api/v1/groups/:group_id/blocks?account_ids[]=…
     * @see DELETE /api/v1/groups/:group_id/blocks?account_ids[]=…
     * @see POST /api/v1/groups/:group_id/promote?role=new_role&account_ids[]=…
     * @see POST /api/v1/groups/:group_id/demote?role=new_role&account_ids[]=…
     * @see GET /api/v1/admin/groups
     * @see GET /api/v1/admin/groups/:group_id
     * @see POST /api/v1/admin/groups/:group_id/suspend
     * @see POST /api/v1/admin/groups/:group_id/unsuspend
     * @see DELETE /api/v1/admin/groups/:group_id
     */
    groups: any([
      v.software === PIXELFED,
      instance.api_versions['groups.pleroma.pl-api'] >= 1,
    ]),

    groupsSlugs: instance.api_versions['groups.pleroma.pl-api'] >= 1,

    /**
     * Can hide follows/followers lists and counts.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    hideNetwork: any([
      v.software === GOTOSOCIAL && gte(v.version, '0.15.0'),
      v.software === PLEROMA,
    ]),

    /**
     * Import a .csv file with a list of blocked users.
     * @see POST /api/pleroma/blocks_import
     * @see POST /api/v1/import
     */
    importBlocks: any([
      v.software === GOTOSOCIAL && gte(v.version, '0.17.0'),
      v.software === PLEROMA,
    ]),

    /**
     * Import a .csv file with a list of followed users.
     * @see POST /api/pleroma/follow_import
     * @see POST /api/v1/import

     */
    importFollows: any([
      v.software === GOTOSOCIAL && gte(v.version, '0.17.0'),
      v.software === PLEROMA,
    ]),

    /**
     * Import a .csv file with a list of muted users.
     * @see POST /api/pleroma/mutes_import
     */
    importMutes: v.software === PLEROMA,

    /**
     * Allow to specify mode of data import to either `merge` or `overwrite`.
     * @see POST /api/v1/import
     */
    importOverwrite: v.software === GOTOSOCIAL && gte(v.version, '0.17.0'),

    /**
     * View posts from specific instance.
     * @see GET /api/v1/timelines/public
     */
    instanceTimeline: v.software === PLEROMA,

    /**
     * Mastodon server information API v2.
     * @see GET /api/v2/instance
     * @see {@link https://docs.joinmastodon.org/methods/instance/#v2}
    */
    instanceV2: any([
      v.software === FIREFISH,
      v.software === GOTOSOCIAL,
      v.software === MASTODON && gte(v.compatVersion, '4.0.0'),
      v.software === MITRA && gte(v.version, '2.18.0'),
      v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.6.0'),
      v.software === PLEROMA && gte(v.version, '2.7.0'),
    ]),

    interactionRequests: v.software === GOTOSOCIAL && gte(v.version, '0.17.0'),

    /**
     * Server-side status language detection.
     */
    languageDetection: instance.api_versions['language_detection.pleroma.pl-api'] >= 1,

    /**
     * Can translate multiple statuses in a single request.
     * @see POST /api/v1/pl/statuses/translate
     */
    lazyTranslations: instance.api_versions['translations.pl.pl-api'] >= 1,

    /**
     * Can create, view, and manage lists.
     * @see {@link https://docs.joinmastodon.org/methods/lists/}
     * @see GET /api/v1/timelines/list/:list_id
     */
    lists: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PLEROMA,
    ]),

    /**
     * Can add a list to favourites.
     * @see POST /api/v1/lists/:list_id/favourite
     * @see POST /api/v1/lists/:list_id/unfavourite
     */
    listsFavourites: instance.api_versions['favourite_list.fedibird.pl-api'] >= 1,

    /**
     * Ability to post statuses that don't federate.
     * @see POST /api/v1/statuses
     */
    localOnlyStatuses: federation && any([
      v.software === GOTOSOCIAL,
      v.software === MASTODON && v.build === HOMETOWN,
    ]),

    /**
     * Can sign in using username instead of e-mail address.
     */
    logInWithUsername: any([
      v.software === PLEROMA,
      v.software === TOKI,
    ]),

    /**
     * Can view and manage ActivityPub aliases through the API.
     * @see GET /api/pleroma/aliases
     * @see PATCH /api/v1/accounts/update_credentials
     */
    manageAccountAliases: v.software === PLEROMA,

    /**
     * @see GET /api/pleroma/accounts/mfa
     * @see GET /api/pleroma/accounts/mfa/backup_codes
     * @see GET /api/pleroma/accounts/mfa/setup/:method
     * @see POST /api/pleroma/accounts/mfa/confirm/:method
     * @see DELETE /api/pleroma/accounts/mfa/:method
     */
    manageMfa: v.software === PLEROMA,

    /**
     * Can perform moderation actions with account and reports.
     * @see {@link https://docs.joinmastodon.org/methods/admin/}
     * @see GET /api/v1/admin/reports
     * @see POST /api/v1/admin/reports/:report_id/resolve
     * @see POST /api/v1/admin/reports/:report_id/reopen
     * @see POST /api/v1/admin/accounts/:account_id/action
     * @see POST /api/v1/admin/accounts/:account_id/approve
     */
    mastodonAdmin: any([
      v.software === DITTO,
      v.software === GOTOSOCIAL,
      v.software === MASTODON,
      v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.5.0'),
      v.software === PLEROMA && v.build === PL,
    ]),

    /**
     * Can perform moderation actions with account and reports.
     * @see {@link https://docs.joinmastodon.org/methods/admin/}
     * @see GET /api/v2/admin/accounts
     */
    mastodonAdminV2: any([
      v.software === MASTODON && gte(v.version, '3.5.0'),
    ]),

    /**
     * Supports V2 media uploads.
     * @see POST /api/v2/media
     */
    mediaV2: any([
      v.software === FIREFISH,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PLEROMA,
      v.software === TAKAHE,
      v.software === TOKI,
      v.software === WORDPRESS,
    ]),

    /**
     * Ability to include multiple language variants for a post.
     * @see POST /api/v1/statuses
     */
    multiLanguage: instance.api_versions['multi_language.pleroma.pl-api'] >= 1,

    /**
     * Ability to hide notifications from people you don't follow.
     * @see PUT /api/pleroma/notification_settings
     */
    muteStrangers: v.software === PLEROMA,

    /**
     * Ability to mute users.
     * @see GET /api/v1/mutes
     * @see POST /api/v1/accounts/:id/mute
     * @see POST /api/v1/accounts/:id/unmute
     */
    mutes: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === GOTOSOCIAL && gte(v.version, '0.16.0'),
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PIXELFED,
      v.software === PLEROMA,
      v.software === TAKAHE,
    ]),

    /**
     * Ability to specify how long the account mute should last.
     * @see PUT /api/v1/accounts/:id/mute
     */
    mutesDuration: any([
      v.software === FIREFISH,
      v.software === GOTOSOCIAL && gte(v.version, '0.16.0'),
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === PLEROMA,
      v.software === TAKAHE,
    ]),

    /**
     * Add private notes to accounts.
     * @see POST /api/v1/accounts/:id/note
     * @see GET /api/v1/accounts/relationships
     */
    notes: any([
      v.software === MASTODON,
      v.software === PLEROMA && gte(v.version, '2.5.0'),
      v.software === GOTOSOCIAL,
    ]),

    /**
     * @see DELETE /api/v1/notifications/destroy_multiple
     */
    notificationsDismissMultiple: v.software === PLEROMA,

    /**
     * @see GET /api/v1/notifications
     */
    notificationsExcludeVisibilities: v.software === PLEROMA,

    /**
     * @see GET /api/v1/notifications/unread_count
     */
    notificationsGetUnreadCount: instance.api_versions.mastodon >= 1,

    /**
     * Allows specifying notification types to include, rather than to exclude.
     * @see GET /api/v1/notifications
     */
    notificationsIncludeTypes: any([
      v.software === FIREFISH,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === PLEROMA && gte(v.version, '2.5.0'),
      v.software === TAKAHE && gte(v.version, '0.6.2'),
      v.software === GOTOSOCIAL,
    ]),

    /**
     * @see GET /api/v2/notifications/policy
     * @see PATCH /api/v2/notifications/policy
     */
    notificationsPolicy: instance.api_versions.mastodon >= 1,

    /**
     * @see POST /api/v1/notifications/requests/accept
     * @see POST /api/v1/notifications/requests/dismiss
     */
    notificationsRequestsAcceptMultiple: instance.api_versions.mastodon >= 1,

    pleromaAdminAccounts: v.software === PLEROMA,

    /**
     * Ability to manage announcements by admins.
     * @see GET /api/v1/pleroma/admin/announcements
     * @see GET /api/v1/pleroma/admin/announcements/:id
     * @see POST /api/v1/pleroma/admin/announcements
     * @see PATCH /api/v1/pleroma/admin/announcements/:id
     * @see DELETE /api/v1/pleroma/admin/announcements/:id
     * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminannouncements}
     */
    pleromaAdminAnnouncements: v.software === PLEROMA,

    pleromaAdminModerationLog: v.software === PLEROMA,

    pleromaAdminRelays: v.software === PLEROMA,

    /**
     * Ability to manage instance rules by admins.
     * @see GET /api/v1/pleroma/admin/rules
     * @see POST /api/v1/pleroma/admin/rules
     * @see PATCH /api/v1/pleroma/admin/rules/:id
     * @see DELETE /api/v1/pleroma/admin/rules/:id
     */
    pleromaAdminRules: any([
      v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.5.0'),
      v.software === PLEROMA && gte(v.version, '2.7.0'),
    ]),

    pleromaAdminStatuses: v.software === PLEROMA,

    /**
     * Displays a form to follow a user when logged out.
     * @see POST /main/ostatus
     */
    pleromaRemoteFollow: v.software === PLEROMA,

    /**
     * Can add polls to statuses.
     * @see POST /api/v1/statuses
     */
    polls: any([
      v.software === FIREFISH,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA && gte(v.version, '3.15.0'),
      v.software === TAKAHE && gte(v.version, '0.8.0'),
      v.software === GOTOSOCIAL,
      instance.api_versions['polls.pleroma.pl-api'] >= 1,
    ]),

    /**
     * Can select a language for statuses.
     * @see POST /api/v1/statuses
     */
    postLanguages: any([
      v.software === MASTODON,
      v.software === PLEROMA && v.build === AKKOMA,
      v.software === PLEROMA && v.build === PL,
      v.software === PLEROMA && v.build === REBASED,
      v.software === GOTOSOCIAL,
    ]),

    /**
     * @see GET /api/v1/akkoma/preferred_frontend/available
     * @see PUT /api/v1/akkoma/preferred_frontend
     */
    preferredFrontends: v.software === PLEROMA && v.build === AKKOMA,

    /**
     * Can set privacy scopes on statuses.
     * @see POST /api/v1/statuses
     */
    privacyScopes: true,

    /**
     * A directory of discoverable profiles from the instance.
     * @see {@link https://docs.joinmastodon.org/methods/directory/}
     */
    profileDirectory: any([
      v.software === FRIENDICA,
      v.software === MASTODON,
      v.software === MITRA,
      instance.api_versions['profile_directory.pleroma.pl-api'] >= 1,
    ]),

    /**
     * Ability to set custom profile fields.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    profileFields: any([
      v.software === DITTO,
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PLEROMA,
      v.software === TAKAHE && gte(v.version, '0.7.0'),
    ]),

    /**
     * Returns favorites timeline of any user
     * @see GET /api/v1/pleroma/accounts/:id/favourites
     */
    publicFavourites: v.software === PLEROMA,

    /**
     * Can display a timeline of all known public statuses.
     * Local and Fediverse timelines both use this feature.
     * @see GET /api/v1/timelines/public
     */
    publicTimeline: any([
      v.software === DITTO,
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PLEROMA,
      v.software === TAKAHE,
      v.software === TOKI,
      v.software === WORDPRESS,
    ]),

    /**
     * Ability to quote posts in statuses.
     * @see POST /api/v1/statuses
     */
    quotePosts: any([
      v.software === ICESHRIMP_NET,
      v.software === FRIENDICA && gte(v.version, '2023.3.0'),
      v.software === PLEROMA && [REBASED, AKKOMA].includes(v.build!) && gte(v.version, '2.5.0'),
      instance.api_versions['quote_posting.pleroma.pl-api'] >= 1,
      instance.feature_quote === true,
    ]),

    /**
     * Ability to boost a status to a selected scope.
     * @see POST /api/v1/statuses/:id/reblog
     */
    reblogVisibility: any([
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === PLEROMA,
    ]),

    /**
     * Interact with statuses from another instance while logged-out.
     * @see POST /api/v1/pleroma/remote_interaction
     */
    remoteInteractions: v.software === PLEROMA && gte(v.version, '2.5.0'),

    /**
     * Ability to remove an account from your followers.
     * @see POST /api/v1/accounts/:id/remove_from_followers
     */
    removeFromFollowers: any([
      v.software === ICESHRIMP_NET,
      v.software === MASTODON,
      v.software === MITRA && gte(v.version, '2.17.0'),
      v.software === PLEROMA && gte(v.version, '2.5.0'),
      v.software === PLEROMA && v.build === AKKOMA,
    ]),

    /**
     * Can request a password reset email through the API.
     * @see POST /auth/password
     */
    resetPassword: v.software === PLEROMA,

    /**
     * Ability to post statuses in Markdown, BBCode, and HTML.
     * @see POST /api/v1/statuses
     */
    richText: any([
      v.software === MASTODON && v.build === GLITCH,
      v.software === PLEROMA,
      v.software === MITRA,
      v.software === GOTOSOCIAL,
      instance.pleroma.metadata.post_formats.length > 1,
    ]),

    /**
     * Ability to follow account feeds using RSS.
     */
    rssFeeds: any([
      v.software === MASTODON,
      v.software === PLEROMA,
      v.software === GOTOSOCIAL,
    ]),

    /**
     * Ability to subscribe to RSS feeds.
     * @see GET /api/v1/pleroma/rss_feed_subscriptions
     * @see POST /api/v1/pleroma/rss_feed_subscriptions
     * @see DELETE /api/v1/pleroma/rss_feed_subscriptions
     */
    rssFeedSubscriptions: instance.api_versions['rss_feed_subscriptions.pleroma.pl-api'] >= 1,

    /**
     * Can schedule statuses to be posted at a later time.
     * @see POST /api/v1/statuses
     * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/}
     */
    scheduledStatuses: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === MASTODON,
      v.software === PLEROMA,
      v.software === GOTOSOCIAL,
    ]),

    /**
     * Can create Listen activities
     * @see GET /api/v1/pleroma/accounts/:id/scrobbles
     * @see POST /api/v1/pleroma/scrobble
     */
    scrobbles: v.software === PLEROMA && v.build !== AKKOMA,

    /**
     * Ability to search statuses from the given account.
     * @see {@link https://docs.joinmastodon.org/methods/search/}
     * @see POST /api/v2/search
     */
    searchFromAccount: any([
      v.software === DITTO,
      v.software === GOTOSOCIAL,
      v.software === ICESHRIMP,
      v.software === MASTODON,
      v.software === PLEROMA,
    ]),

    /**
     * @see POST /api/v1/user/email_change
     */
    changeEmail: any([
      v.software === GOTOSOCIAL && gte(v.version, '0.16.0'),
      v.software === PLEROMA,
    ]),

    /**
     * @see POST /api/v1/user/password_change
     * @see POST /api/v1/settings/change_password
     * @see POST /api/v1.1/accounts/change-password
     * @see POST /api/pleroma/change_password
     */
    changePassword: any([
      v.software === GOTOSOCIAL,
      v.software === MITRA,
      v.software === PIXELFED,
      v.software === PLEROMA,
    ]),

    /**
     * Ability to manage account sessions.
     * @see GET /api/oauth_tokens.json
     * @see DELETE /api/oauth_tokens/:id
     */
    sessions: v.software === PLEROMA,

    /**
     * Can store client settings in the database.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    settingsStore: v.software === PLEROMA,

    /**
     * Can set content warnings on statuses.
     * @see POST /api/v1/statuses
     */
    spoilers: v.software !== MITRA,

    /**
     * @see POST /api/friendica/statuses/:id/dislike
     * @see POST /api/friendica/statuses/:id/undislike
     * @see GET  /api/friendica/statuses/:id/disliked_by
     */
    statusDislikes: v.software === FRIENDICA && gte(v.version, '2023.3.0'),

    /**
     * Can display suggested accounts.
     * @see {@link https://docs.joinmastodon.org/methods/suggestions/}
     */
    suggestions: any([
      v.software === FRIENDICA,
      v.software === ICESHRIMP,
      v.software === MASTODON,
      v.software === PIXELFED,
      instance.api_versions['v2_suggestions.pleroma.pl-api'] >= 1,
    ]),

    /**
     * Remove an account from follow suggestions
     * @see DELETE /api/v1/suggestions/:account_id
     */
    suggestionsDismiss: any([
      v.software === MASTODON,
    ]),

    /**
     * Supports V2 suggested accounts.
     * @see GET /api/v2/suggestions
     */
    suggestionsV2: any([
      v.software === FRIENDICA,
      v.software === ICESHRIMP,
      v.software === MASTODON,
      instance.api_versions['v2_suggestions.pleroma.pl-api'] >= 1,
    ]),

    /**
     * Can translate statuses.
     * @see POST /api/v1/statuses/:id/translate
     */
    translations: any([
      instance.api_versions['translation.pleroma.pl-api'] >= 1,
      instance.api_versions['machine_translation.akkoma.pl-api'] >= 1,
      instance.configuration.translation.enabled,
    ]),

    /**
     * Trending links.
     * @see GET /api/v1/trends/links
     */
    trendingLinks: v.software === MASTODON && gte(v.compatVersion, '3.5.0'),

    /**
     * Trending statuses.
     * @see GET /api/v1/trends/statuses
     */
    trendingStatuses: any([
      v.software === DITTO,
      v.software === FIREFISH,
      v.software === FRIENDICA && gte(v.version, '2022.12.0'),
      v.software === ICESHRIMP,
      v.software === MASTODON,
      v.software === PIXELFED,
    ]),

    /**
     * Display trends from a given time range.
     * @see GET /api/pixelfed/v2/discover/posts/trending
     */
    trendingStatusesRange: v.software === PIXELFED,

    /**
     * Can display trending hashtags.
     * @see GET /api/v1/trends
     */
    trends: any([
      v.software === DITTO,
      v.software === FIREFISH,
      v.software === FRIENDICA && gte(v.version, '2022.12.0'),
      v.software === ICESHRIMP,
      v.software === MASTODON,
      v.software === PIXELFED,
    ]),

    /**
     * Whether the backend allows adding users you don't follow to lists.
     * @see POST /api/v1/lists/:id/accounts
     */
    unrestrictedLists: v.software === PLEROMA,
  };
};

/** Features available from a backend */
type Features = ReturnType<typeof getFeatures>;

/** Fediverse backend */
interface Backend {
  /** Build name, if this software is a fork */
  build: string | null;
  /** Name of the software */
  software: string | null;
  /** API version number */
  version: string;
  /** Mastodon API version this backend is compatible with */
  compatVersion: string;
}

/** Get information about the software from its version string */
const parseVersion = (version: string): Backend => {
  const regex = /^([\w+.-]*)(?: \(compatible; ([\w.]*) (.*)\))?$/;
  const match = regex.exec(version.replace('/', ' '));

  const semverString = match && (match[3] || match[1]);
  const semver = match ? semverParse(semverString) || semverCoerce(semverString, {
    loose: true,
  }) : null;
  const compat = match ? semverParse(match[1]) || semverCoerce(match[1]) : null;
  if (match && semver && compat) {
    return {
      build: semver.build[0]?.split('-')[0],
      compatVersion: compat.version,
      software: match[2] || MASTODON,
      version: semver.version.split('-')[0],
    };
  } else {
    // If we can't parse the version, this is a new and exotic backend.
    // Fall back to minimal featureset.
    return {
      build: null,
      compatVersion: '0.0.0',
      software: null,
      version: '0.0.0',
    };
  }
};

export {
  DITTO,
  FIREFISH,
  FRIENDICA,
  GOTOSOCIAL,
  ICESHRIMP,
  ICESHRIMP_NET,
  MASTODON,
  MITRA,
  PIXELFED,
  PLEROMA,
  TAKAHE,
  TOKI,
  WORDPRESS,
  AKKOMA,
  GLITCH,
  HOMETOWN,
  PL,
  REBASED,
  UNRELEASED,
  type Features,
  type Backend as BackendVersion,
  getFeatures,
};
