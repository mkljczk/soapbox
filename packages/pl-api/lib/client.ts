import { WebSocket } from 'isows';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import * as v from 'valibot';

import {
  accountSchema,
  adminAccountSchema,
  adminAnnouncementSchema,
  adminCanonicalEmailBlockSchema,
  adminCohortSchema,
  adminDimensionSchema,
  adminDomainAllowSchema,
  adminDomainBlockSchema,
  adminDomainSchema,
  adminEmailDomainBlockSchema,
  adminIpBlockSchema,
  adminMeasureSchema,
  adminModerationLogEntrySchema,
  adminRelaySchema,
  adminReportSchema,
  adminRuleSchema,
  adminTagSchema,
  announcementSchema,
  applicationSchema,
  backupSchema,
  bookmarkFolderSchema,
  chatMessageSchema,
  chatSchema,
  contextSchema,
  conversationSchema,
  credentialAccountSchema,
  credentialApplicationSchema,
  customEmojiSchema,
  domainBlockSchema,
  emojiReactionSchema,
  extendedDescriptionSchema,
  familiarFollowersSchema,
  featuredTagSchema,
  filterKeywordSchema,
  filterSchema,
  filterStatusSchema,
  groupMemberSchema,
  groupRelationshipSchema,
  groupSchema,
  instanceSchema,
  interactionPoliciesSchema,
  interactionRequestSchema,
  listSchema,
  locationSchema,
  markersSchema,
  mediaAttachmentSchema,
  mutedAccountSchema,
  notificationPolicySchema,
  notificationRequestSchema,
  notificationSchema,
  oauthTokenSchema,
  pleromaConfigSchema,
  pollSchema,
  relationshipSchema,
  reportSchema,
  ruleSchema,
  scheduledStatusSchema,
  scrobbleSchema,
  searchSchema,
  statusEditSchema,
  statusSchema,
  statusSourceSchema,
  streamingEventSchema,
  suggestionSchema,
  tagSchema,
  tokenSchema,
  translationSchema,
  trendsLinkSchema,
  webPushSubscriptionSchema,
} from './entities';
import { GroupedNotificationsResults, groupedNotificationsResultsSchema, NotificationGroup } from './entities/grouped-notifications-results';
import { filteredArray } from './entities/utils';
import { AKKOMA, type Features, getFeatures, GOTOSOCIAL, MITRA } from './features';
import {
  CreateScrobbleParams,
  FollowAccountParams,
  GetAccountEndorsementsParams,
  GetAccountFavouritesParams,
  GetAccountFollowersParams,
  GetAccountFollowingParams,
  GetAccountParams,
  GetAccountStatusesParams,
  GetRelationshipsParams,
  GetScrobblesParams,
  ReportAccountParams,
  SearchAccountParams,
} from './params/accounts';
import { CreateApplicationParams } from './params/apps';
import {
  CreateChatMessageParams,
  GetChatMessagesParams,
  GetChatsParams,
} from './params/chats';
import {
  CreateEventParams,
  EditEventParams,
  GetEventParticipationRequestsParams,
  GetEventParticipationsParams,
  GetJoinedEventsParams,
} from './params/events';
import {
  CreateFilterParams,
  GetBlocksParams,
  GetDomainBlocksParams,
  GetMutesParams,
  MuteAccountParams,
  UpdateFilterParams,
} from './params/filtering';
import { GetGroupedNotificationsParams, GetUnreadNotificationGroupCountParams } from './params/grouped-notifications';
import {
  CreateGroupParams,
  GetGroupBlocksParams,
  GetGroupMembershipRequestsParams,
  GetGroupMembershipsParams,
  UpdateGroupParams,
} from './params/groups';
import { ProfileDirectoryParams } from './params/instance';
import {
  GetInteractionRequestsParams,
} from './params/interaction-requests';
import {
  CreateListParams,
  GetListAccountsParams,
  UpdateListParams,
} from './params/lists';
import {
  UpdateMediaParams,
  UploadMediaParams,
} from './params/media';
import {
  CreateBookmarkFolderParams,
  GetBookmarksParams,
  GetEndorsementsParams,
  GetFavouritesParams,
  GetFollowedTagsParams,
  GetFollowRequestsParams,
  UpdateBookmarkFolderParams,
} from './params/my-account';
import {
  GetNotificationParams,
  GetNotificationRequestsParams,
  GetUnreadNotificationCountParams,
  UpdateNotificationPolicyRequest,
} from './params/notifications';
import {
  GetTokenParams,
  MfaChallengeParams,
  OauthAuthorizeParams,
  RevokeTokenParams,
} from './params/oauth';
import {
  CreatePushNotificationsSubscriptionParams,
  UpdatePushNotificationsSubscriptionParams,
} from './params/push-notifications';
import { GetScheduledStatusesParams } from './params/scheduled-statuses';
import { SearchParams } from './params/search';
import {
  CreateAccountParams,
  UpdateCredentialsParams,
  UpdateInteractionPoliciesParams,
  UpdateNotificationSettingsParams,
} from './params/settings';
import {
  CreateStatusParams,
  EditStatusParams,
  GetFavouritedByParams,
  GetRebloggedByParams,
  GetStatusContextParams,
  GetStatusesParams,
  GetStatusParams,
  GetStatusQuotesParams,
} from './params/statuses';
import {
  BubbleTimelineParams,
  GetConversationsParams,
  GroupTimelineParams,
  HashtagTimelineParams,
  HomeTimelineParams,
  ListTimelineParams,
  PublicTimelineParams,
  SaveMarkersParams,
} from './params/timelines';
import {
  GetTrendingLinks,
  GetTrendingStatuses,
  GetTrendingTags,
} from './params/trends';
import request, { getNextLink, getPrevLink, type RequestBody, RequestMeta } from './request';
import { buildFullPath } from './utils/url';

import type {
  Account,
  AdminAccount,
  AdminAnnouncement,
  AdminModerationLogEntry,
  AdminReport,
  GroupRole,
  Instance,
  Notification,
  PleromaConfig,
  Status,
  StreamingEvent,
} from './entities';
import type { PlApiResponse } from './main';
import type {
  AdminAccountAction,
  AdminCreateAnnouncementParams,
  AdminCreateDomainBlockParams,
  AdminCreateDomainParams,
  AdminCreateIpBlockParams,
  AdminCreateRuleParams,
  AdminDimensionKey,
  AdminGetAccountsParams,
  AdminGetAnnouncementsParams,
  AdminGetCanonicalEmailBlocks,
  AdminGetDimensionsParams,
  AdminGetDomainAllowsParams,
  AdminGetDomainBlocksParams,
  AdminGetEmailDomainBlocksParams,
  AdminGetGroupsParams,
  AdminGetIpBlocksParams,
  AdminGetMeasuresParams,
  AdminGetModerationLogParams,
  AdminGetReportsParams,
  AdminGetStatusesParams,
  AdminMeasureKey,
  AdminPerformAccountActionParams,
  AdminUpdateAnnouncementParams,
  AdminUpdateDomainBlockParams,
  AdminUpdateReportParams,
  AdminUpdateRuleParams,
  AdminUpdateStatusParams,
} from './params/admin';
import type { PaginatedResponse } from './responses';

const GROUPED_TYPES = ['favourite', 'reblog', 'emoji_reaction', 'event_reminder', 'participation_accepted', 'participation_request'];

interface PlApiClientConstructorOpts {
  /** Instance object to use by default, to be populated eg. from cache */
  instance?: Instance;
  /** Fetch instance after constructing */
  fetchInstance?: boolean;
  /** Abort signal which can be used to cancel the callbacks */
  fetchInstanceSignal?: AbortSignal;
  /** Executed after the initial instance fetch */
  onInstanceFetchSuccess?: (instance: Instance) => void;
  /** Executed when the initial instance fetch failed */
  onInstanceFetchError?: (error?: any) => void;
}

/**
 * @category Clients
 *
 * Mastodon API client.
 */
class PlApiClient {

  baseURL: string;
  #accessToken?: string;
  #instance: Instance = v.parse(instanceSchema, {});
  public request = request.bind(this) as typeof request;
  public features: Features = getFeatures(this.#instance);
  #socket?: {
    listen: (listener: any, stream?: string) => number;
    unlisten: (listener: any) => void;
    subscribe: (stream: string, params?: { list?: string; tag?: string }) => void;
    unsubscribe: (stream: string, params?: { list?: string; tag?: string }) => void;
    close: () => void;
  };

  /**
   *
   * @param baseURL Mastodon API-compatible server URL
   * @param accessToken OAuth token for an authorized user
   */
  constructor(baseURL: string, accessToken?: string, {
    instance,
    fetchInstance,
    fetchInstanceSignal,
    onInstanceFetchSuccess,
    onInstanceFetchError,
  }: PlApiClientConstructorOpts = {}) {
    this.baseURL = baseURL;
    this.#accessToken = accessToken;

    if (instance) {
      this.#setInstance(instance);
    }
    if (fetchInstance) {
      this.instance.getInstance().then((instance) => {
        if (fetchInstanceSignal?.aborted) return;
        onInstanceFetchSuccess?.(instance);
      }).catch((error) => {
        if (fetchInstanceSignal?.aborted) return;
        onInstanceFetchError?.(error);
      });
    }
  }

  #paginatedGet = async <T, IsArray extends true | false = true>(input: URL | RequestInfo, body: RequestBody, schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>, isArray = true as IsArray): Promise<PaginatedResponse<T, typeof isArray>> => {
    const targetSchema = isArray ? filteredArray(schema) : schema;

    const processResponse = (response: PlApiResponse<any>) => ({
      previous: getMore(getPrevLink(response)),
      next: getMore(getNextLink(response)),
      items: v.parse(targetSchema, response.json),
      partial: response.status === 206,
    } as PaginatedResponse<T, IsArray>);

    const getMore = (input: string | null) => input ? () => this.request(input).then(processResponse) : null;

    const response = await this.request(input, body);

    return processResponse(response);
  };

  #paginatedPleromaAccounts = async (params: {
    query?: string;
    filters?: string;
    page?: number;
    page_size: number;
    tags?: Array<string>;
    actor_types?: Array<string>;
    name?: string;
    email?: string;
  }): Promise<PaginatedResponse<AdminAccount>> => {
    const response = await this.request('/api/v1/pleroma/admin/users', { params });

    return {
      previous: !params.page ? null : () => this.#paginatedPleromaAccounts({ ...params, page: params.page! - 1 }),
      next: response.json?.count > (params.page_size * ((params.page || 1) - 1) + response.json?.users?.length)
        ? () => this.#paginatedPleromaAccounts({ ...params, page: (params.page || 0) + 1 })
        : null,
      items: v.parse(filteredArray(adminAccountSchema), response.json?.users),
      partial: response.status === 206,
      total: response.json?.total,
    };
  };

  #paginatedPleromaReports = async (params: {
    state?: 'open' | 'closed' | 'resolved';
    limit?: number;
    page?: number;
    page_size: number;
  }): Promise<PaginatedResponse<AdminReport>> => {
    const response = await this.request('/api/v1/pleroma/admin/reports', { params });

    return {
      previous: !params.page ? null : () => this.#paginatedPleromaReports({ ...params, page: params.page! - 1 }),
      next: response.json?.total > (params.page_size * ((params.page || 1) - 1) + response.json?.reports?.length)
        ? () => this.#paginatedPleromaReports({ ...params, page: (params.page || 0) + 1 })
        : null,
      items: v.parse(filteredArray(adminReportSchema), response.json?.reports),
      partial: response.status === 206,
      total: response.json?.total,
    };
  };

  #paginatedPleromaStatuses = async (params: {
    page_size?: number;
    local_only?: boolean;
    godmode?: boolean;
    with_reblogs?: boolean;
    page?: number;
  }): Promise<PaginatedResponse<Status>> => {
    const response = await this.request('/api/v1/pleroma/admin/statuses', { params });

    return {
      previous: !params.page ? null : () => this.#paginatedPleromaStatuses({ ...params, page: params.page! - 1 }),
      next: response.json?.length
        ? () => this.#paginatedPleromaStatuses({ ...params, page: (params.page || 0) + 1 })
        : null,
      items: v.parse(filteredArray(statusSchema), response.json),
      partial: response.status === 206,
    };
  };

  #groupNotifications = ({ previous, next, items, ...response }: PaginatedResponse<Notification>, params?: GetGroupedNotificationsParams): PaginatedResponse<GroupedNotificationsResults, false> => {
    const notificationGroups: Array<NotificationGroup> = [];

    for (const notification of items) {
      let existingGroup: NotificationGroup | undefined;
      if ((params?.grouped_types || GROUPED_TYPES).includes(notification.type)) {
        existingGroup = notificationGroups
          .find(notificationGroup =>
            notificationGroup.type === notification.type
              && ((notification.type === 'emoji_reaction' && notificationGroup.type === 'emoji_reaction') ? notification.emoji === notificationGroup.emoji : true)
              // @ts-ignore
              && notificationGroup.status_id === notification.status?.id,
          );
      }

      if (existingGroup) {
        existingGroup.notifications_count += 1;
        existingGroup.page_min_id = notification.id;
        existingGroup.sample_account_ids.push(notification.account.id);
      } else {
        notificationGroups.push({
          ...(omit(notification, ['account', 'status', 'target'])),
          group_key: notification.id,
          notifications_count: 1,
          most_recent_notification_id: notification.id,
          page_min_id: notification.id,
          page_max_id: notification.id,
          latest_page_notification_at: notification.created_at,
          sample_account_ids: [notification.account.id],
          // @ts-ignore
          status_id: notification.status?.id,
          // @ts-ignore
          target_id: notification.target?.id,
        });
      }
    }

    const groupedNotificationsResults: GroupedNotificationsResults = {
      accounts: Object.values(items.reduce<Record<string, Account>>((accounts, notification) => {
        accounts[notification.account.id] = notification.account;
        if ('target' in notification) accounts[notification.target.id] = notification.target;

        return accounts;
      }, {})),
      statuses: Object.values(items.reduce<Record<string, Status>>((statuses, notification) => {
        if ('status' in notification) statuses[notification.status.id] = notification.status;
        return statuses;
      }, {})),
      notification_groups: notificationGroups,
    };

    return {
      ...response,
      previous: previous ? async () => this.#groupNotifications(await previous(), params) : null,
      next: next ? async () => this.#groupNotifications(await next(), params) : null,
      items: groupedNotificationsResults,
    };
  };

  /** Register client applications that can be used to obtain OAuth tokens. */
  public readonly apps = {
    /**
     * Create an application
     * Create a new application to obtain OAuth2 credentials.
     * @see {@link https://docs.joinmastodon.org/methods/apps/#create}
     */
    createApplication: async (params: CreateApplicationParams) => {
      const response = await this.request('/api/v1/apps', { method: 'POST', body: params });

      return v.parse(credentialApplicationSchema, response.json);
    },

    /**
     * Verify your app works
     * Confirm that the app’s OAuth2 credentials work.
     * @see {@link https://docs.joinmastodon.org/methods/apps/#verify_credentials}
     */
    verifyApplication: async () => {
      const response = await this.request('/api/v1/apps/verify_credentials');

      return v.parse(applicationSchema, response.json);
    },
  };

  public readonly oauth = {
    /**
     * Authorize a user
     * Displays an authorization form to the user. If approved, it will create and return an authorization code, then redirect to the desired `redirect_uri`, or show the authorization code if `urn:ietf:wg:oauth:2.0:oob` was requested. The authorization code can be used while requesting a token to obtain access to user-level methods.
     * @see {@link https://docs.joinmastodon.org/methods/oauth/#authorize}
     */
    authorize: async (params: OauthAuthorizeParams) => {
      const response = await this.request('/oauth/authorize', { params });

      return v.parse(v.string(), response.json);
    },

    /**
     * Obtain a token
     * Obtain an access token, to be used during API calls that are not public.
     * @see {@link https://docs.joinmastodon.org/methods/oauth/#token}
     */
    getToken: async (params: GetTokenParams) => {
      const response = await this.request('/oauth/token', { method: 'POST', body: params });

      return v.parse(tokenSchema, response.json);
    },

    /**
     * Revoke a token
     * Revoke an access token to make it no longer valid for use.
     * @see {@link https://docs.joinmastodon.org/methods/oauth/#revoke}
     */
    revokeToken: async (params: RevokeTokenParams) => {
      const response = await this.request('/oauth/revoke', { method: 'POST', body: params });

      this.#socket?.close();

      return response.json as {};
    },

    /**
     * Get a new captcha
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apiv1pleromacaptcha}
    */
    getCaptcha: async () => {
      const response = await this.request('/api/pleroma/captcha');

      return v.parse(v.intersect([v.object({
        type: v.string(),
      }), v.record(v.string(), v.any())]), response.json);
    },

    mfaChallenge: async (params: MfaChallengeParams) => {
      const response = await this.request('/oauth/mfa/challenge', { method: 'POST', body: params });

      return v.parse(tokenSchema, response.json);
    },
  };

  public readonly emails = {
    resendConfirmationEmail: async (email: string) => {
      const response = await this.request('/api/v1/emails/confirmations', { method: 'POST', body: { email } });

      return response.json as {};
    },
  };

  public readonly accounts = {
    /**
     * Get account
     * View information about a profile.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#get}
     */
    getAccount: async (accountId: string, params?: GetAccountParams) => {
      const response = await this.request(`/api/v1/accounts/${accountId}`, { params });

      return v.parse(accountSchema, response.json);
    },

    /**
     * Get multiple accounts
     * View information about multiple profiles.
     *
     * Requires features{@link Features['getAccounts']}.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#index}
     */
    getAccounts: async (accountId: string[]) => {
      const response = await this.request('/api/v1/accounts', { params: { id: accountId } });

      return v.parse(filteredArray(accountSchema), response.json);
    },

    /**
     * Get account’s statuses
     * Statuses posted to the given account.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#statuses}
     */
    getAccountStatuses: async (accountId: string, params?: GetAccountStatusesParams) =>
      this.#paginatedGet(`/api/v1/accounts/${accountId}/statuses`, { params }, statusSchema),

    /**
     * Get account’s followers
     * Accounts which follow the given account, if network is not hidden by the account owner.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#followers}
     */
    getAccountFollowers: async (accountId: string, params?: GetAccountFollowersParams) =>
      this.#paginatedGet(`/api/v1/accounts/${accountId}/followers`, { params }, accountSchema),

    /**
     * Get account’s following
     * Accounts which the given account is following, if network is not hidden by the account owner.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#following}
     */
    getAccountFollowing: async (accountId: string, params?: GetAccountFollowingParams) =>
      this.#paginatedGet(`/api/v1/accounts/${accountId}/following`, { params }, accountSchema),

    /**
     * Get account’s featured tags
     * Tags featured by this account.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#featured_tags}
     */
    getAccountFeaturedTags: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/featured_tags`);

      return v.parse(filteredArray(featuredTagSchema), response.json);
    },

    /**
     * Get lists containing this account
     * User lists that you have added this account to.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#lists}
     */
    getAccountLists: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/lists`);

      return v.parse(filteredArray(listSchema), response.json);
    },

    /**
     * Follow account
     * Follow the given account. Can also be used to update whether to show reblogs or enable notifications.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#follow}
     */
    followAccount: async (accountId: string, params?: FollowAccountParams) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/follow`, { method: 'POST', body: params });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Unfollow account
     * Unfollow the given account.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#unfollow}
     */
    unfollowAccount: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/unfollow`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Remove account from followers
     * Remove the given account from your followers.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#remove_from_followers}
     */
    removeAccountFromFollowers: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/remove_from_followers`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Feature account on your profile
     * Add the given account to the user’s featured profiles.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#pin}
     */
    pinAccount: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/pin`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Unfeature account from profile
     * Remove the given account from the user’s featured profiles.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#unpin}
     */
    unpinAccount: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/unpin`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Set private note on profile
     * Sets a private note on a user.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#note}
     */
    updateAccountNote: async (accountId: string, comment: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/note`, { method: 'POST', body: { comment } });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Check relationships to other accounts
     * Find out whether a given account is followed, blocked, muted, etc.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#relationships}
     */
    getRelationships: async (accountIds: string[], params?: GetRelationshipsParams) => {
      const response = await this.request('/api/v1/accounts/relationships', { params: { ...params, id: accountIds } });

      return v.parse(filteredArray(relationshipSchema), response.json);
    },

    /**
     * Find familiar followers
     * Obtain a list of all accounts that follow a given account, filtered for accounts you follow.
     *
     * Requires features{@link Features['familiarFollowers']}.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#familiar_followers}
     */
    getFamiliarFollowers: async (accountIds: string[]) => {
      const response = await this.request('/api/v1/accounts/familiar_followers', { params: { id: accountIds } });

      return v.parse(filteredArray(familiarFollowersSchema), response.json);
    },

    /**
     * Search for matching accounts
     * Search for matching accounts by username or display name.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#search}
     */
    searchAccounts: async (q: string, params?: SearchAccountParams, meta?: RequestMeta) => {
      const response = await this.request('/api/v1/accounts/search', { ...meta, params: { ...params, q } });

      return v.parse(filteredArray(accountSchema), response.json);
    },

    /**
     * Lookup account ID from Webfinger address
     * Quickly lookup a username to see if it is available, skipping WebFinger resolution.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#lookup}
     */
    lookupAccount: async (acct: string, meta?: RequestMeta) => {
      const response = await this.request('/api/v1/accounts/lookup', { ...meta, params: { acct } });

      return v.parse(accountSchema, response.json);
    },

    /**
     * File a report
     * @see {@link https://docs.joinmastodon.org/methods/reports/#post}
     */
    reportAccount: async (accountId: string, params: ReportAccountParams) => {
      const response = await this.request('/api/v1/reports', {
        method: 'POST',
        body: { ...params, account_id: accountId },
      });

      return v.parse(reportSchema, response.json);
    },

    /**
     * Endorsements
     * Returns endorsed accounts
     *
     * Requires features{@link Features['accountEndorsements']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apiv1pleromaaccountsidendorsements}
     */
    getAccountEndorsements: async (accountId: string, params?: GetAccountEndorsementsParams) => {
      const response = await this.request(`/api/v1/pleroma/accounts/${accountId}/endorsements`, { params });

      return v.parse(filteredArray(accountSchema), response.json);
    },

    /**
     * Birthday reminders
     * Birthday reminders about users you follow.
     *
     * Requires features{@link Features['birthdays']}.
     */
    getBirthdays: async (day: number, month: number) => {
      const response = await this.request('/api/v1/pleroma/birthdays', { params: { day, month } });

      return v.parse(filteredArray(accountSchema), response.json);
    },

    /**
     * Returns favorites timeline of any user
     *
     * Requires features{@link Features['publicFavourites']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apiv1pleromaaccountsidfavourites}
     */
    getAccountFavourites: async (accountId: string, params?: GetAccountFavouritesParams) =>
      this.#paginatedGet(`/api/v1/pleroma/accounts/${accountId}/favourites`, { params }, statusSchema),

    /**
     * Interact with profile or status from remote account
     *
     * Requires features{@link Features['remoteInteractions']}.
     * @param ap_id - Profile or status ActivityPub ID
     * @param profile - Remote profile webfinger
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apiv1pleromaremote_interaction}
     */
    remoteInteraction: async (ap_id: string, profile: string) => {
      const response = await this.request('/api/v1/pleroma/remote_interaction', { method: 'POST', body: { ap_id, profile } });

      if (response.json?.error) throw response.json.error;

      return v.parse(v.object({
        url: v.string(),
      }), response.json);
    },

    /**
     * Bite the given user.
     *
     * Requires features{@link Features['bites']}.
     * @see {@link https://github.com/purifetchi/Toki/blob/master/Toki/Controllers/MastodonApi/Bite/BiteController.cs}
     */
    biteAccount: async (accountId: string) => {
      const response = await this.request('/api/v1/bite', { method: 'POST', params: { id: accountId } });

      return response.json as {};
    },

    /**
     * Requests a list of current and recent Listen activities for an account
     *
     * Requires features{@link Features['scrobbles']}
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apiv1pleromaaccountsidscrobbles}
     */
    getScrobbles: async (accountId: string, params?: GetScrobblesParams) =>
      this.#paginatedGet(`/api/v1/pleroma/accounts/${accountId}/scrobbles`, { params }, scrobbleSchema),

    /**
     * Creates a new Listen activity for an account
     *
     * Requires features{@link Features['scrobbles']}
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#post-apiv1pleromascrobble}
     */
    createScrobble: async (params: CreateScrobbleParams) => {
      if (params.external_link) (params as any).externalLink = params.external_link;

      const response = await this.request('/api/v1/pleroma/scrobble', { body: params });

      return v.parse(scrobbleSchema, response.json);
    },
  };

  public readonly myAccount = {
    /**
     * View bookmarked statuses
     * Statuses the user has bookmarked.
     * @see {@link https://docs.joinmastodon.org/methods/bookmarks/#get}
     */
    getBookmarks: async (params?: GetBookmarksParams) =>
      this.#paginatedGet('/api/v1/bookmarks', { params }, statusSchema),

    /**
     * View favourited statuses
     * Statuses the user has favourited.
     * @see {@link https://docs.joinmastodon.org/methods/favourites/#get}
     */
    getFavourites: async (params?: GetFavouritesParams) =>
      this.#paginatedGet('/api/v1/favourites', { params }, statusSchema),

    /**
     * View pending follow requests
     * @see {@link https://docs.joinmastodon.org/methods/follow_requests/#get}
     */
    getFollowRequests: async (params?: GetFollowRequestsParams) =>
      this.#paginatedGet('/api/v1/follow_requests', { params }, accountSchema),

    /**
     * Accept follow request
     * @see {@link https://docs.joinmastodon.org/methods/follow_requests/#accept}
     */
    acceptFollowRequest: async (accountId: string) => {
      const response = await this.request(`/api/v1/follow_requests/${accountId}/authorize`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Reject follow request
     * @see {@link https://docs.joinmastodon.org/methods/follow_requests/#reject}
     */
    rejectFollowRequest: async (accountId: string) => {
      const response = await this.request(`/api/v1/follow_requests/${accountId}/reject`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * View currently featured profiles
     * Accounts that the user is currently featuring on their profile.
     * @see {@link https://docs.joinmastodon.org/methods/endorsements/#get}
     */
    getEndorsements: async (params?: GetEndorsementsParams) =>
      this.#paginatedGet('/api/v1/endorsements', { params }, accountSchema),

    /**
     * View your featured tags
     * List all hashtags featured on your profile.
     * @see {@link https://docs.joinmastodon.org/methods/featured_tags/#get}
     */
    getFeaturedTags: async () => {
      const response = await this.request('/api/v1/featured_tags');

      return v.parse(filteredArray(featuredTagSchema), response.json);
    },

    /**
     * Feature a tag
     * Promote a hashtag on your profile.
     * @see {@link https://docs.joinmastodon.org/methods/featured_tags/#feature}
     */
    featureTag: async (name: string) => {
      const response = await this.request('/api/v1/featured_tags', {
        method: 'POST',
        body: { name },
      });

      return v.parse(filteredArray(featuredTagSchema), response.json);
    },

    /**
     * Unfeature a tag
     * Stop promoting a hashtag on your profile.
     * @see {@link https://docs.joinmastodon.org/methods/featured_tags/#unfeature}
     */
    unfeatureTag: async (name: string) => {
      const response = await this.request('/api/v1/featured_tags', {
        method: 'DELETE',
        body: { name },
      });

      return response.json as {};
    },

    /**
     * View suggested tags to feature
     * Shows up to 10 recently-used tags.
     * @see {@link https://docs.joinmastodon.org/methods/featured_tags/#suggestions}
     */
    getFeaturedTagsSuggestions: async () => {
      const response = await this.request('/api/v1/featured_tags/suggestions');

      return v.parse(filteredArray(tagSchema), response.json);
    },

    /**
     * View all followed tags
     * List your followed hashtags.
     *
     * Requires features{@link Features['followHashtags']}.
     * @see {@link https://docs.joinmastodon.org/methods/followed_tags/#get}
     */
    getFollowedTags: async (params?: GetFollowedTagsParams) =>
      this.#paginatedGet('/api/v1/followed_tags', { params }, tagSchema),

    /**
     * View information about a single tag
     * Show a hashtag and its associated information
     * @see {@link https://docs.joinmastodon.org/methods/tags/#get}
     */
    getTag: async (tagId: string) => {
      const response = await this.request(`/api/v1/tags/${tagId}`);

      return v.parse(tagSchema, response.json);
    },

    /**
     * Follow a hashtag
     * Follow a hashtag. Posts containing a followed hashtag will be inserted into your home timeline.
     * @see {@link https://docs.joinmastodon.org/methods/tags/#follow}
     */
    followTag: async (tagId: string) => {
      const response = await this.request(`/api/v1/tags/${tagId}/follow`, { method: 'POST' });

      return v.parse(tagSchema, response.json);
    },

    /**
     * Unfollow a hashtag
     * Unfollow a hashtag. Posts containing this hashtag will no longer be inserted into your home timeline.
     * @see {@link https://docs.joinmastodon.org/methods/tags/#unfollow}
     */
    unfollowTag: async (tagId: string) => {
      const response = await this.request(`/api/v1/tags/${tagId}/unfollow`, { method: 'POST' });

      return v.parse(tagSchema, response.json);
    },

    /**
     * View follow suggestions
     * Accounts that are promoted by staff, or that the user has had past positive interactions with, but is not yet following.
     *
     * Requires features{@link Features['suggestions']}.
     * @see {@link https://docs.joinmastodon.org/methods/suggestions/#v2}
     */
    getSuggestions: async (limit?: number) => {
      const response = await this.request(
        this.features.suggestionsV2 ? '/api/v2/suggestions' : '/api/v1/suggestions',
        { params: { limit } },
      );

      return v.parse(filteredArray(suggestionSchema), response.json);
    },

    /**
     * Remove a suggestion
     * Remove an account from follow suggestions.
     *
     * Requires features{@link Features['suggestionsDismiss']}.
     * @see {@link https://docs.joinmastodon.org/methods/suggestions/#remove}
     */
    dismissSuggestions: async (accountId: string) => {
      const response = await this.request(`/api/v1/suggestions/${accountId}`, { method: 'DELETE' });

      return response.json as {};
    },

    /**
     * Gets user bookmark folders
     *
     * Requires features{@link Features['bookmarkFolders']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apiv1pleromabookmark_folders}
     */
    getBookmarkFolders: async () => {
      const response = await this.request('/api/v1/pleroma/bookmark_folders');

      return v.parse(filteredArray(bookmarkFolderSchema), response.json);
    },

    /**
     * Creates a bookmark folder
     *
     * Requires features{@link Features['bookmarkFolders']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#post-apiv1pleromabookmark_folders}
     */
    createBookmarkFolder: async (params: CreateBookmarkFolderParams) => {
      const response = await this.request('/api/v1/pleroma/bookmark_folders', { method: 'POST', body: params });

      return v.parse(bookmarkFolderSchema, response.json);
    },

    /**
     * Updates a bookmark folder
     *
     * Requires features{@link Features['bookmarkFolders']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#patch-apiv1pleromabookmark_foldersid}
     */
    updateBookmarkFolder: async (bookmarkFolderId: string, params: UpdateBookmarkFolderParams) => {
      const response = await this.request(`/api/v1/pleroma/bookmark_folders/${bookmarkFolderId}`, { method: 'PATCH', body: params });

      return v.parse(bookmarkFolderSchema, response.json);
    },

    /**
     * Deletes a bookmark folder
     *
     * Requires features{@link Features['bookmarkFolders']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#delete-apiv1pleromabookmark_foldersid}
     */
    deleteBookmarkFolder: async (bookmarkFolderId: string) => {
      const response = await this.request(`/api/v1/pleroma/bookmark_folders/${bookmarkFolderId}`, { method: 'DELETE' });

      return v.parse(bookmarkFolderSchema, response.json);
    },
  };

  public readonly settings = {
    /**
     * Register an account
     * Creates a user and account records. Returns an account access token for the app that initiated the request. The app should save this token for later, and should wait for the user to confirm their account by clicking a link in their email inbox.
     *
     * Requires features{@link Features['accountCreation']}
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#create}
     */
    createAccount: async (params: CreateAccountParams) => {
      const response = await this.request('/api/v1/accounts', {
        method: 'POST',
        body: { language: params.locale, ...params },
      });

      return v.parse(tokenSchema, response.json);
    },

    /**
     * Verify account credentials
     * Test to make sure that the user token works.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#verify_credentials}
     */
    verifyCredentials: async () => {
      const response = await this.request('/api/v1/accounts/verify_credentials');

      return v.parse(credentialAccountSchema, response.json);
    },

    /**
     * Update account credentials
     * Update the user’s display and preferences.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#update_credentials}
     */
    updateCredentials: async (params: UpdateCredentialsParams) => {
      if (params.background_image) {
        (params as any).pleroma_background_image = params.background_image;
        delete params.background_image;
      }

      if (params.settings_store) {
        (params as any).pleroma_settings_store = params.settings_store;
        delete params.settings_store;
      }

      const response = await this.request('/api/v1/accounts/update_credentials', {
        method: 'PATCH',
        contentType: (this.features.version.software === GOTOSOCIAL || params.avatar || params.header) ? '' : undefined,
        body: params,
      });

      return v.parse(credentialAccountSchema, response.json);
    },

    /**
     * Delete profile avatar
     * Deletes the avatar associated with the user’s profile.
     * @see {@link https://docs.joinmastodon.org/methods/profile/#delete-profile-avatar}
     */
    deleteAvatar: async () => {
      const response = await this.request('/api/v1/profile/avatar', { method: 'DELETE' });

      return v.parse(credentialAccountSchema, response.json);
    },

    /**
     * Delete profile header
     * Deletes the header image associated with the user’s profile.
     * @see {@link https://docs.joinmastodon.org/methods/profile/#delete-profile-header}
     */
    deleteHeader: async () => {
      const response = await this.request('/api/v1/profile/header', { method: 'DELETE' });

      return v.parse(credentialAccountSchema, response.json);
    },

    /**
     * View user preferences
     * Preferences defined by the user in their account settings.
     * @see {@link https://docs.joinmastodon.org/methods/preferences/#get}
     */
    getPreferences: async () => {
      const response = await this.request('/api/v1/preferences');

      return response.json as Record<string, any>;
    },

    /**
     * Create a user backup archive
     *
     * Requires features{@link Features['accountBackups']}.
     */
    createBackup: async () => {
      const response = await this.request('/api/v1/pleroma/backups', { method: 'POST' });

      return v.parse(backupSchema, response.json);
    },

    /**
     * List user backups
     *
     * Requires features{@link Features['accountBackups']}.
     */
    getBackups: async () => {
      const response = await this.request('/api/v1/pleroma/backups');

      return v.parse(filteredArray(backupSchema), response.json);
    },

    /**
     * Get aliases of the current account
     *
     * Requires features{@link Features['manageAccountAliases']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-aliases-of-the-current-account}
     */
    getAccountAliases: async () => {
      const response = await this.request('/api/v1/pleroma/aliases');

      return v.parse(v.object({ aliases: filteredArray(v.string()) }), response.json);
    },

    /**
     * Add alias to the current account
     *
     * Requires features{@link Features['manageAccountAliases']}.
     * @param alias - the nickname of the alias to add, e.g. foo@example.org.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#add-alias-to-the-current-account}
     */
    addAccountAlias: async (alias: string) => {
      const response = await this.request('/api/v1/pleroma/aliases', { method: 'PUT', body: { alias } });

      return v.parse(v.object({ status: v.literal('success') }), response.json);
    },

    /**
     * Delete alias from the current account
     *
     * Requires features{@link Features['manageAccountAliases']}.
     * @param alias - the nickname of the alias to add, e.g. foo@example.org.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#delete-alias-from-the-current-account}
     */
    deleteAccountAlias: async (alias: string) => {
      const response = await this.request('/api/v1/pleroma/aliases', { method: 'DELETE', body: { alias } });

      return v.parse(v.object({ status: v.literal('success') }), response.json);
    },

    /**
     * Retrieve a list of active sessions for the user
     *
     * Requires features{@link Features['sessions']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apioauth_tokens}
     */
    getOauthTokens: async () => {
      const response = await this.request('/api/oauth_tokens');

      return v.parse(filteredArray(oauthTokenSchema), response.json);
    },

    /**
     * Revoke a user session by its ID
     *
     * Requires features{@link Features['sessions']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#delete-apioauth_tokensid}
     */
    deleteOauthToken: async (oauthTokenId: number) => {
      const response = await this.request(`/api/oauth_tokens/${oauthTokenId}`, { method: 'DELETE' });

      return response.json as {};
    },

    /**
     * Change account password
     * @see {@link https://docs.gotosocial.org/en/latest/api/swagger}
     * @see {@link https://codeberg.org/silverpill/mitra/src/commit/f15c19527191d82bc3643f984deca43d1527525d/docs/openapi.yaml}
     * @see {@link https://git.pleroma.social/pleroma/pleroma/-/blob/develop/lib/pleroma/web/api_spec/operations/twitter_util_operation.ex?ref_type=heads#L68}
     */
    changePassword: async (current_password: string, new_password: string) => {
      let response;

      switch (this.features.version.software) {
        case GOTOSOCIAL:
          response = await this.request('/api/v1/user/password_change', {
            method: 'POST',
            body: {
              old_password: current_password,
              new_password,
            },
          });
          break;
        case MITRA:
          response = await this.request('/api/v1/settings/change_password', {
            method: 'POST',
            body: { new_password },
          });
          break;
        default:
          response = await this.request('/api/pleroma/change_password', {
            method: 'POST',
            body: {
              password: current_password,
              new_password,
              new_password_confirmation: new_password,
            },
          });
      }

      return response.json as {};
    },

    /**
     * Request password reset e-mail
     *
     * Requires features{@link Features['resetPassword']}.
     */
    resetPassword: async (email?: string, nickname?: string) => {
      const response = await this.request('/auth/password', {
        method: 'POST',
        body: { email, nickname },
      });

      return response.json as {};
    },

    /**
     * Requires features{@link Features['changeEmail']}.
     */
    changeEmail: async (email: string, password: string) => {
      let response;

      switch (this.features.version.software) {
        case GOTOSOCIAL:
          response = await this.request('/api/v1/user/email_change', {
            method: 'POST',
            body: {
              new_email: email,
              password,
            },
          });
          break;
        default:
          response = await this.request('/api/pleroma/change_email', {
            method: 'POST',
            body: {
              email,
              password,
            },
          });
      }

      if (response.json?.error) throw response.json.error;

      return response.json as {};
    },

    /**
     * Requires features{@link Features['deleteAccount']}.
     */
    deleteAccount: async (password: string) => {
      let response;

      switch (this.features.version.software) {
        case GOTOSOCIAL:
          response = await this.request('/api/v1/accounts/delete', {
            method: 'POST',
            body: { password },
          });
          break;
        default:
          response = await this.request('/api/pleroma/delete_account', {
            method: 'POST',
            body: { password },
          });
      }

      if (response.json?.error) throw response.json.error;

      return response.json as {};
    },

    /**
     * Disable an account
     *
     * Requires features{@link Features['disableAccount']}.
     */
    disableAccount: async (password: string) => {
      const response = await this.request('/api/pleroma/disable_account', {
        method: 'POST',
        body: { password },
      });

      if (response.json?.error) throw response.json.error;

      return response.json as {};
    },

    /**
     * Requires features{@link Features['accountMoving']}.
     */
    moveAccount: async (target_account: string, password: string) => {
      const response = await this.request('/api/pleroma/move_account', {
        method: 'POST',
        body: { password, target_account },
      });

      if (response.json?.error) throw response.json.error;

      return response.json as {};
    },

    mfa: {
      /**
       * Requires features{@link Features['manageMfa']}.
       */
      getMfaSettings: async () => {
        const response = await this.request('/api/pleroma/accounts/mfa');

        return v.parse(v.object({
          settings: v.object({
            enabled: v.boolean(),
            totp: v.boolean(),
          }),
        }), response.json);
      },

      /**
       * Requires features{@link Features['manageMfa']}.
       */
      getMfaBackupCodes: async () => {
        const response = await this.request('/api/pleroma/accounts/mfa/backup_codes');

        return v.parse(v.object({
          codes: v.array(v.string()),
        }), response.json);
      },

      /**
       * Requires features{@link Features['manageMfa']}.
       */
      getMfaSetup: async (method: 'totp') => {
        const response = await this.request(`/api/pleroma/accounts/mfa/setup/${method}`);

        return v.parse(v.object({
          key: v.string(),
          provisioning_uri: v.string(),
        }), response.json);
      },

      /**
       * Requires features{@link Features['manageMfa']}.
       */
      confirmMfaSetup: async (method: 'totp', code: string, password: string) => {
        const response = await this.request(`/api/pleroma/accounts/mfa/confirm/${method}`, {
          method: 'POST',
          body: { code, password },
        });

        if (response.json?.error) throw response.json.error;

        return response.json as {};
      },

      /**
       * Requires features{@link Features['manageMfa']}.
       */
      disableMfa: async (method: 'totp', password: string) => {
        const response = await this.request(`/api/pleroma/accounts/mfa/${method}`, {
          method: 'DELETE',
          body: { password },
        });

        if (response.json?.error) throw response.json.error;

        return response.json as {};
      },
    },

    /**
     * Imports your follows, for example from a Mastodon CSV file.
     *
     * Requires features{@link Features['importFollows']}.
     * `overwrite` mode requires features{@link Features['importOverwrite']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apipleromafollow_import}
     */
    importFollows: async (list: File | string, mode?: 'merge' | 'overwrite') => {
      let response;

      switch (this.features.version.software) {
        case GOTOSOCIAL:
          response = await this.request('/api/v1/import', {
            method: 'POST',
            body: { data: list, type: 'following', mode },
            contentType: '',
          });
          break;
        default:
          response = await this.request('/api/pleroma/follow_import', {
            method: 'POST',
            body: { list },
            contentType: '',
          });
      }

      return response.json;
    },

    /**
     * Imports your blocks.
     *
     * Requires features{@link Features['importBlocks']}.
     * `overwrite` mode requires features{@link Features['importOverwrite']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apipleromablocks_import}
     */
    importBlocks: async (list: File | string, mode?: 'merge' | 'overwrite') => {
      let response;

      switch (this.features.version.software) {
        case GOTOSOCIAL:
          response = await this.request('/api/v1/import', {
            method: 'POST',
            body: { data: list, type: 'blocks', mode },
            contentType: '',
          });
          break;
        default:
          response = await this.request('/api/pleroma/blocks_import', {
            method: 'POST',
            body: { list },
            contentType: '',
          });
      }

      return response.json;
    },

    /**
     * Imports your mutes.
     *
     * Requires features{@link Features['importMutes']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apipleromamutes_import}
     */
    importMutes: async (list: File | string) => {
      const response = await this.request('/api/pleroma/mutes_import', {
        method: 'POST',
        body: { list },
        contentType: '',
      });

      return response.json;
    },

    /**
     * Updates user notification settings
     *
     * Requires features{@link Features['muteStrangers']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apipleromanotification_settings}
     */
    updateNotificationSettings: async (params: UpdateNotificationSettingsParams) => {
      const response = await this.request('/api/pleroma/notification_settings', { method: 'PUT', body: params });

      if (response.json?.error) throw response.json.error;

      return v.parse(v.object({ status: v.string() }), response.json);
    },

    /**
     * Get default interaction policies for new statuses created by you.
     *
     * Requires features{@link Features['interactionRequests']}.
     * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
     */
    getInteractionPolicies: async () => {
      const response = await this.request('/api/v1/interaction_policies/defaults');

      return v.parse(interactionPoliciesSchema, response.json);
    },

    /**
     * Update default interaction policies per visibility level for new statuses created by you.
     *
     * Requires features{@link Features['interactionRequests']}.
     * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
     */
    updateInteractionPolicies: async (params: UpdateInteractionPoliciesParams) => {
      const response = await this.request('/api/v1/interaction_policies/defaults', { method: 'PATCH', body: params });

      return v.parse(interactionPoliciesSchema, response.json);
    },

    /**
     * List frontend setting profiles
     *
     * Requires features{@link Features['preferredFrontends']}.
     */
    getAvailableFrontends: async () => {
      const response = await this.request('/api/v1/akkoma/preferred_frontend/available');

      return v.parse(v.array(v.string()), response.json);
    },

    /**
     * Update preferred frontend setting
     *
     * Store preferred frontend in cookies
     *
     * Requires features{@link Features['preferredFrontends']}.
     */
    setPreferredFrontend: async (frontendName: string) => {
      const response = await this.request('/api/v1/akkoma/preferred_frontend', { method: 'PUT', body: { frontend_name: frontendName } });

      return v.parse(v.object({ frontend_name: v.string() }), response.json);
    },
  };

  public readonly filtering = {
    /**
     * Block account
     * Block the given account. Clients should filter statuses from this account if received (e.g. due to a boost in the Home timeline)
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#block}
     */
    blockAccount: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/block`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Unblock account
     * Unblock the given account.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#unblock}
     */
    unblockAccount: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/unblock`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Mute account
     * Mute the given account. Clients should filter statuses and notifications from this account, if received (e.g. due to a boost in the Home timeline).
     *
     * Requires features{@link Features['mutes']}.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#mute}
     */
    muteAccount: async (accountId: string, params?: MuteAccountParams) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/mute`, { method: 'POST', body: params });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * Unmute account
     * Unmute the given account.
     *
     * Requires features{@link Features['mutes']}.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/#unmute}
     */
    unmuteAccount: async (accountId: string) => {
      const response = await this.request(`/api/v1/accounts/${accountId}/unmute`, { method: 'POST' });

      return v.parse(relationshipSchema, response.json);
    },

    /**
     * View muted accounts
     * Accounts the user has muted.
     *
     * Requires features{@link Features['mutes']}.
     * @see {@link https://docs.joinmastodon.org/methods/mutes/#get}
     */
    getMutes: async (params?: GetMutesParams) =>
      this.#paginatedGet('/api/v1/mutes', { params }, mutedAccountSchema),

    /**
     * View blocked users
     * @see {@link https://docs.joinmastodon.org/methods/blocks/#get}
     */
    getBlocks: async (params?: GetBlocksParams) =>
      this.#paginatedGet('/api/v1/blocks', { params }, accountSchema),

    /**
     * Get domain blocks
     * View domains the user has blocked.
     * @see {@link https://docs.joinmastodon.org/methods/domain_blocks/#get}
     */
    getDomainBlocks: async (params?: GetDomainBlocksParams) =>
      this.#paginatedGet('/api/v1/domain_blocks', { params }, v.string()),

    /**
     * Block a domain
     * Block a domain to:
     * - hide all public posts from it
     * - hide all notifications from it
     * - remove all followers from it
     * - prevent following new users from it (but does not remove existing follows)
     * @see {@link https://docs.joinmastodon.org/methods/domain_blocks/#block}
     */
    blockDomain: async (domain: string) => {
      const response = await this.request('/api/v1/domain_blocks', { method: 'POST', body: { domain } });

      return response.json as {};
    },

    /**
     * Unblock a domain
     * Remove a domain block, if it exists in the user’s array of blocked domains.
     * @see {@link https://docs.joinmastodon.org/methods/domain_blocks/#unblock}
     */
    unblockDomain: async (domain: string) => {
      const response = await this.request('/api/v1/domain_blocks', {
        method: 'DELETE',
        body: { domain },
      });

      return response.json as {};
    },

    /**
     * View all filters
     * Obtain a list of all filter groups for the current user.
     *
     * Requires features{@link Features['filters']} or features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#get}
     */
    getFilters: async () => {
      const response = await this.request(this.features.filtersV2 ? '/api/v2/filters' : '/api/v1/filters');

      return v.parse(filteredArray(filterSchema), response.json);
    },

    /**
     * View a specific filter
     * Obtain a single filter group owned by the current user.
     *
     * Requires features{@link Features['filters']} or features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#get-one}
     */
    getFilter: async (filterId: string) => {
      const response = await this.request(
        this.features.filtersV2
          ? `/api/v2/filters/${filterId}`
          : `/api/v1/filters/${filterId}`,
      );

      return v.parse(filterSchema, response.json);
    },

    /**
     * Create a filter
     * Create a filter group with the given parameters.
     *
     * Requires features{@link Features['filters']} or features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#create}
     */
    createFilter: async (params: CreateFilterParams) => {
      const { filtersV2 } = this.features;
      const response = await this.request(
        filtersV2 ? '/api/v2/filters' : '/api/v1/filters',
        {
          method: 'POST',
          body: filtersV2 ? params : {
            phrase: params.keywords_attributes[0]?.keyword,
            context: params.context,
            irreversible: params.filter_action === 'hide',
            whole_word: params.keywords_attributes[0]?.whole_word,
            expires_in: params.expires_in,
          },
        },
      );

      return v.parse(filterSchema, response.json);
    },

    /**
     * Update a filter
     * Update a filter group with the given parameters.
     *
     * Requires features{@link Features['filters']} or features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#update}
     */
    updateFilter: async (filterId: string, params: UpdateFilterParams) => {
      const { filtersV2 } = this.features;
      const response = await this.request(
        filtersV2 ? `/api/v2/filters/${filterId}` : `/api/v1/filters/${filterId}`,
        {
          method: 'PUT',
          body: filtersV2 ? params : {
            phrase: params.keywords_attributes?.[0]?.keyword,
            context: params.context,
            irreversible: params.filter_action === 'hide',
            whole_word: params.keywords_attributes?.[0]?.whole_word,
            expires_in: params.expires_in,
          },
        },
      );

      return v.parse(filterSchema, response.json);
    },

    /**
     * Delete a filter
     * Delete a filter group with the given id.
     *
     * Requires features{@link Features['filters']} or features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#delete}
     */
    deleteFilter: async (filterId: string) => {
      const response = await this.request(
        this.features.filtersV2
          ? `/api/v2/filters/${filterId}`
          : `/api/v1/filters/${filterId}`,
        { method: 'DELETE' },
      );

      return response.json as {};
    },

    /**
     * View keywords added to a filter
     * List all keywords attached to the current filter group.
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-get}
     */
    getFilterKeywords: async (filterId: string) => {
      const response = await this.request(`/api/v2/filters/${filterId}/keywords`);

      return v.parse(filteredArray(filterKeywordSchema), response.json);
    },

    /**
     * Add a keyword to a filter
     * Add the given keyword to the specified filter group
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-create}
     */
    addFilterKeyword: async (filterId: string, keyword: string, whole_word?: boolean) => {
      const response = await this.request(`/api/v2/filters/${filterId}/keywords`, {
        method: 'POST',
        body: { keyword, whole_word },
      });

      return v.parse(filterKeywordSchema, response.json);
    },

    /**
     * View a single keyword
     * Get one filter keyword by the given id.
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-get-one}
     */
    getFilterKeyword: async (filterId: string) => {
      const response = await this.request(`/api/v2/filters/keywords/${filterId}`);

      return v.parse(filterKeywordSchema, response.json);
    },

    /**
     * Edit a keyword within a filter
     * Update the given filter keyword.
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-update}
     */
    updateFilterKeyword: async (filterId: string, keyword: string, whole_word?: boolean) => {
      const response = await this.request(`/api/v2/filters/keywords/${filterId}`, {
        method: 'PUT',
        body: { keyword, whole_word },
      });

      return v.parse(filterKeywordSchema, response.json);
    },

    /**
     * Remove keywords from a filter
     * Deletes the given filter keyword.
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-delete}
     */
    deleteFilterKeyword: async (filterId: string) => {
      const response = await this.request(`/api/v2/filters/keywords/${filterId}`, { method: 'DELETE' });

      return response.json as {};
    },

    /**
     * View all status filters
     * Obtain a list of all status filters within this filter group.
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#statuses-get}
     */
    getFilterStatuses: async (filterId: string) => {
      const response = await this.request(`/api/v2/filters/${filterId}/statuses`);

      return v.parse(filteredArray(filterStatusSchema), response.json);
    },

    /**
     * Add a status to a filter group
     * Add a status filter to the current filter group.
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#statuses-add}
     */
    addFilterStatus: async (filterId: string, statusId: string) => {
      const response = await this.request(`/api/v2/filters/${filterId}/statuses`, {
        method: 'POST',
        body: { status_id: statusId },
      });

      return v.parse(filterStatusSchema, response.json);
    },

    /**
     * View a single status filter
     * Obtain a single status filter.
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#statuses-get-one}
     */
    getFilterStatus: async (statusId: string) => {
      const response = await this.request(`/api/v2/filters/statuses/${statusId}`);

      return v.parse(filterStatusSchema, response.json);
    },

    /**
     * Remove a status from a filter group
     * Remove a status filter from the current filter group.
     *
     * Requires features{@link Features['filtersV2']}.
     * @see {@link https://docs.joinmastodon.org/methods/filters/#statuses-remove}
     */
    deleteFilterStatus: async (statusId: string) => {
      const response = await this.request(`/api/v2/filters/statuses/${statusId}`, { method: 'DELETE' });

      return response.json as {};
    },

  };

  public readonly statuses = {
    /**
     * Post a new status
     * Publish a status with the given parameters.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#create}
     */
    createStatus: async (params: CreateStatusParams) => {
      const response = await this.request('/api/v1/statuses', {
        method: 'POST',
        body: params,
      });

      if (response.json?.scheduled_at) return v.parse(scheduledStatusSchema, response.json);
      return v.parse(statusSchema, response.json);
    },

    /**
     * View a single status
     * Obtain information about a status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#get}
     */
    getStatus: async (statusId: string, params?: GetStatusParams) => {
      const response = await this.request(`/api/v1/statuses/${statusId}`, { params });

      return v.parse(statusSchema, response.json);
    },

    /**
     * View multiple statuses
     * Obtain information about multiple statuses.
     *
     * Requires features{@link Features['getStatuses']}.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#index}
    */
    getStatuses: async (statusIds: string[], params?: GetStatusesParams) => {
      const response = await this.request('/api/v1/statuses', { params: { ...params, id: statusIds } });

      return v.parse(filteredArray(statusSchema), response.json);
    },

    /**
     * Delete a status
     * Delete one of your own statuses.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#delete}
    */
    deleteStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}`, { method: 'DELETE' });

      return v.parse(statusSourceSchema, response.json);
    },

    /**
     * Get parent and child statuses in context
     * View statuses above and below this status in the thread.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#context}
     */
    getContext: async (statusId: string, params?: GetStatusContextParams) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/context`, { params });

      return v.parse(contextSchema, response.json);
    },

    /**
     * Translate a status
     * Translate the status content into some language.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#translate}
     */
    translateStatus: async (statusId: string, lang?: string) => {
      let response;
      if (this.features.version.build === AKKOMA) {
        response = await this.request(`/api/v1/statuses/${statusId}/translations/${lang}`);

      } else {
        response = await this.request(`/api/v1/statuses/${statusId}/translate`, { method: 'POST', body: { lang } });
      }

      return v.parse(translationSchema, response.json);
    },

    /**
     * Translate multiple statuses into given language.
     *
     * Requires features{@link Features['lazyTranslations']}.
     */
    translateStatuses: async (statusIds: Array<string>, lang: string) => {
      const response = await this.request('/api/v1/pl/statuses/translate', { method: 'POST', body: { ids: statusIds, lang } });

      return v.parse(filteredArray(translationSchema), response.json);
    },

    /**
     * See who boosted a status
     * View who boosted a given status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#reblogged_by}
     */
    getRebloggedBy: async (statusId: string, params?: GetRebloggedByParams) =>
      this.#paginatedGet(`/api/v1/statuses/${statusId}/reblogged_by`, { params }, accountSchema),

    /**
     * See who favourited a status
     * View who favourited a given status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#favourited_by}
     */
    getFavouritedBy: async (statusId: string, params?: GetFavouritedByParams) =>
      this.#paginatedGet(`/api/v1/statuses/${statusId}/favourited_by`, { params }, accountSchema),

    /**
     * Favourite a status
     * Add a status to your favourites list.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#favourite}
     */
    favouriteStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/favourite`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Undo favourite of a status
     * Remove a status from your favourites list.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unfavourite}
     */
    unfavouriteStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/unfavourite`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Boost a status
     * Reshare a status on your own profile.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#reblog}
     */
    reblogStatus: async (statusId: string, visibility?: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/reblog`, { method: 'POST', body: { visibility } });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Undo boost of a status
     * Undo a reshare of a status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unreblog}
     */
    unreblogStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/unreblog`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Bookmark a status
     * Privately bookmark a status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#bookmark}
     */
    bookmarkStatus: async (statusId: string, folderId?: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/bookmark`, { method: 'POST', body: { folder_id: folderId } });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Undo bookmark of a status
     * Remove a status from your private bookmarks.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unbookmark}
     */
    unbookmarkStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/unbookmark`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Mute a conversation
     * Do not receive notifications for the thread that this status is part of. Must be a thread in which you are a participant.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#mute}
     */
    muteStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/mute`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Unmute a conversation
     * Start receiving notifications again for the thread that this status is part of.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unmute}
     */
    unmuteStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/unmute`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Pin status to profile
     * Feature one of your own public statuses at the top of your profile.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#pin}
     */
    pinStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/pin`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Unpin status from profile
     * Unfeature a status from the top of your profile.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unpin}
     */
    unpinStatus: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/unpin`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Edit a status
     * Edit a given status to change its text, sensitivity, media attachments, or poll. Note that editing a poll’s options will reset the votes.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unpin}
     */
    editStatus: async (statusId: string, params: EditStatusParams) => {
      const response = await this.request(`/api/v1/statuses/${statusId}`, { method: 'PUT', body: params });

      return v.parse(statusSchema, response.json);
    },

    /**
     * View edit history of a status
     * Get all known versions of a status, including the initial and current states.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#history}
     */
    getStatusHistory: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/history`);

      return v.parse(filteredArray(statusEditSchema), response.json);
    },

    /**
     * View status source
     * Obtain the source properties for a status so that it can be edited.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#source}
     */
    getStatusSource: async (statusId: string) => {
      const response = await this.request(`/api/v1/statuses/${statusId}/source`);

      return v.parse(statusSourceSchema, response.json);
    },

    /**
     * Get an object of emoji to account mappings with accounts that reacted to the post
     *
     * Requires features{@link Features['emojiReactsList']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apiv1pleromastatusesidreactions}
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apiv1pleromastatusesidreactionsemoji}
     */
    getStatusReactions: async (statusId: string, emoji?: string) => {
      const apiVersions = this.#instance.api_versions;

      let response;
      if (apiVersions['emoji_reactions.pleroma.pl-api'] >= 1) {
        response = await this.request(`/api/v1/pleroma/statuses/${statusId}/reactions${emoji ? `/${emoji}` : ''}`);
      } else if (apiVersions['emoji_reaction.fedibird.pl-api'] >= 1) {
        response = await this.request(`/api/v1/statuses/${statusId}/emoji_reactioned_by`);
        response.json = response.json?.reduce((acc: Array<any>, cur: any) => {
          if (emoji && cur.name !== emoji) return acc;

          const existing = acc.find(reaction => reaction.name === cur.name);

          if (existing) {
            existing.accounts.push(cur.account);
            existing.account_ids.push(cur.account.id);
            existing.count += 1;
          } else acc.push({ count: 1, accounts: [cur.account], account_ids: [cur.account.id], ...cur });

          return acc;
        }, []);
      }

      return v.parse(filteredArray(emojiReactionSchema), response?.json || []);
    },

    /**
     * React to a post with a unicode emoji
     *
     * Requires features{@link Features['emojiReacts']}.
     * Using custom emojis requires features{@link Features['customEmojiReacts']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#put-apiv1pleromastatusesidreactionsemoji}
     */
    createStatusReaction: async (statusId: string, emoji: string) => {
      const apiVersions = this.#instance.api_versions;

      let response;
      if (apiVersions['emoji_reactions.pleroma.pl-api'] >= 1 || this.features.version.software === MITRA) {
        response = await this.request(`/api/v1/pleroma/statuses/${statusId}/reactions/${encodeURIComponent(emoji)}`, { method: 'PUT' });
      } else {
        response = await this.request(`/api/v1/statuses/${statusId}/react/${encodeURIComponent(emoji)}`, { method: 'POST' });
      }

      return v.parse(statusSchema, response.json);
    },

    /**
     * Remove a reaction to a post with a unicode emoji
     *
     * Requires features{@link Features['emojiReacts']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#delete-apiv1pleromastatusesidreactionsemoji}
     */
    deleteStatusReaction: async (statusId: string, emoji: string) => {
      const apiVersions = this.#instance.api_versions;

      let response;
      if (apiVersions['emoji_reactions.pleroma.pl-api'] >= 1 || this.features.version.software === MITRA) {
        response = await this.request(`/api/v1/pleroma/statuses/${statusId}/reactions/${emoji}`, { method: 'DELETE' });
      } else {
        response = await this.request(`/api/v1/statuses/${statusId}/unreact/${encodeURIComponent(emoji)}`, { method: 'POST' });
      }

      return v.parse(statusSchema, response.json);
    },

    /**
     * View quotes for a given status
     *
     * Requires features{@link Features['quotePosts']}.
     */
    getStatusQuotes: async (statusId: string, params?: GetStatusQuotesParams) =>
      this.#paginatedGet(`/api/v1/pleroma/statuses/${statusId}/quotes`, { params }, statusSchema),

    /**
     * Returns the list of accounts that have disliked the status as known by the current server
     *
     * Requires features{@link Features['statusDislikes']}.
     * @see {@link https://github.com/friendica/friendica/blob/2024.06-rc/doc/API-Friendica.md#get-apifriendicastatusesiddisliked_by}
     */
    getDislikedBy: async (statusId: string) =>
      this.#paginatedGet(`/api/v1/statuses/${statusId}/disliked_by`, {}, accountSchema),

    /**
     * Marks the given status as disliked by this user
     * @see {@link https://github.com/friendica/friendica/blob/2024.06-rc/doc/API-Friendica.md#post-apifriendicastatusesiddislike}
     */
    dislikeStatus: async (statusId: string) => {
      const response = await this.request(`/api/friendica/statuses/${statusId}/dislike`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Removes the dislike mark (if it exists) on this status for this user
     * @see {@link https://github.com/friendica/friendica/blob/2024.06-rc/doc/API-Friendica.md#post-apifriendicastatusesidundislike}
     */
    undislikeStatus: async (statusId: string) => {
      const response = await this.request(`/api/friendica/statuses/${statusId}/undislike`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },
  };

  public readonly media = {
    /**
     * Upload media as an attachment
     * Creates a media attachment to be used with a new status. The full sized media will be processed asynchronously in the background for large uploads.
     * @see {@link https://docs.joinmastodon.org/methods/media/#v2}
     */
    uploadMedia: async (params: UploadMediaParams, meta?: RequestMeta) => {
      const response = await this.request(
        this.features.mediaV2 ? '/api/v2/media' : '/api/v1/media',
        { ...meta, method: 'POST', body: params, contentType: '' },
      );

      return v.parse(mediaAttachmentSchema, response.json);
    },

    /**
     * Get media attachment
     * Get a media attachment, before it is attached to a status and posted, but after it is accepted for processing. Use this method to check that the full-sized media has finished processing.
     * @see {@link https://docs.joinmastodon.org/methods/media/#get}
     */
    getMedia: async (attachmentId: string) => {
      const response = await this.request(`/api/v1/media/${attachmentId}`);

      return v.parse(mediaAttachmentSchema, response.json);
    },

    /**
     * Update media attachment
     * Update a MediaAttachment’s parameters, before it is attached to a status and posted.
     * @see {@link https://docs.joinmastodon.org/methods/media/#update}
     */
    updateMedia: async (attachmentId: string, params: UpdateMediaParams) => {
      const response = await this.request(`/api/v1/media/${attachmentId}`, {
        method: 'PUT',
        body: params, contentType: params.thumbnail ? '' : undefined,
      });

      return v.parse(mediaAttachmentSchema, response.json);
    },
  };

  public readonly polls = {
    /**
     * View a poll
     * View a poll attached to a status.
     * @see {@link https://docs.joinmastodon.org/methods/polls/#get}
     */
    getPoll: async (pollId: string) => {
      const response = await this.request(`/api/v1/polls/${pollId}`);

      return v.parse(pollSchema, response.json);
    },

    /**
     * Vote on a poll
     * Vote on a poll attached to a status.
     * @see {@link https://docs.joinmastodon.org/methods/polls/#vote}
     */
    vote: async (pollId: string, choices: number[]) => {
      const response = await this.request(`/api/v1/polls/${pollId}/votes`, { method: 'POST', body: { choices } });

      return v.parse(pollSchema, response.json);
    },
  };

  public readonly scheduledStatuses = {
    /**
     * View scheduled statuses
     * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/#get}
     */
    getScheduledStatuses: async (params?: GetScheduledStatusesParams) =>
      this.#paginatedGet('/api/v1/scheduled_statuses', { params }, scheduledStatusSchema),

    /**
     * View a single scheduled status
     * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/#get-one}
     */
    getScheduledStatus: async (scheduledStatusId: string) => {
      const response = await this.request(`/api/v1/scheduled_statuses/${scheduledStatusId}`);

      return v.parse(scheduledStatusSchema, response.json);
    },

    /**
     * Update a scheduled status’s publishing date
     * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/#update}
     */
    updateScheduledStatus: async (scheduledStatusId: string, scheduled_at: string) => {
      const response = await this.request(`/api/v1/scheduled_statuses/${scheduledStatusId}`, {
        method: 'PUT',
        body: { scheduled_at },
      });

      return v.parse(scheduledStatusSchema, response.json);
    },

    /**
     * Cancel a scheduled status
     * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/#cancel}
     */
    cancelScheduledStatus: async (scheduledStatusId: string) => {
      const response = await this.request(`/api/v1/scheduled_statuses/${scheduledStatusId}`, { method: 'DELETE' });

      return response.json as {};
    },
  };

  public readonly timelines = {
    /**
     * View public timeline
     * View public statuses.
     * @see {@link https://docs.joinmastodon.org/methods/timelines/#public}
     */
    publicTimeline: (params?: PublicTimelineParams) =>
      this.#paginatedGet('/api/v1/timelines/public', { params }, statusSchema),

    /**
     * View hashtag timeline
     * View public statuses containing the given hashtag.
     * @see {@link https://docs.joinmastodon.org/methods/timelines/#tag}
     */
    hashtagTimeline: (hashtag: string, params?: HashtagTimelineParams) =>
      this.#paginatedGet(`/api/v1/timelines/tag/${hashtag}`, { params }, statusSchema),

    /**
     * View home timeline
     * View statuses from followed users and hashtags.
     * @see {@link https://docs.joinmastodon.org/methods/timelines/#home}
     */
    homeTimeline: (params?: HomeTimelineParams) =>
      this.#paginatedGet('/api/v1/timelines/home', { params }, statusSchema),

    /**
     * View link timeline
     * View public statuses containing a link to the specified currently-trending article. This only lists statuses from people who have opted in to discoverability features.
     * @see {@link https://docs.joinmastodon.org/methods/timelines/#link}
     */
    linkTimeline: (url: string, params?: HashtagTimelineParams) =>
      this.#paginatedGet('/api/v1/timelines/link', { params: { ...params, url } }, statusSchema),

    /**
     * View list timeline
     * View statuses in the given list timeline.
     * @see {@link https://docs.joinmastodon.org/methods/timelines/#list}
     */
    listTimeline: (listId: string, params?: ListTimelineParams) =>
      this.#paginatedGet(`/api/v1/timelines/list/${listId}`, { params }, statusSchema),

    /**
     * View all conversations
     * @see {@link https://docs.joinmastodon.org/methods/conversations/#get}
     */
    getConversations: (params?: GetConversationsParams) =>
      this.#paginatedGet('/api/v1/conversations', { params }, conversationSchema),

    /**
     * Remove a conversation
     * Removes a conversation from your list of conversations.
     * @see {@link https://docs.joinmastodon.org/methods/conversations/#delete}
     */
    deleteConversation: async (conversationId: string) => {
      const response = await this.request(`/api/v1/conversations/${conversationId}`, { method: 'DELETE' });

      return response.json as {};
    },

    /**
     * Mark a conversation as read
     * @see {@link https://docs.joinmastodon.org/methods/conversations/#read}
     */
    markConversationRead: async (conversationId: string) => {
      const response = await this.request(`/api/v1/conversations/${conversationId}/read`, { method: 'POST' });

      return v.parse(conversationSchema, response.json);
    },

    /**
     * Get saved timeline positions
     * Get current positions in timelines.
     * @see {@link https://docs.joinmastodon.org/methods/markers/#get}
     */
    getMarkers: async (timelines?: string[]) => {
      const response = await this.request('/api/v1/markers', { params: { timeline: timelines } });

      return v.parse(markersSchema, response.json);
    },

    /**
     * Save your position in a timeline
     * Save current position in timeline.
     * @see {@link https://docs.joinmastodon.org/methods/markers/#create}
     */
    saveMarkers: async (params: SaveMarkersParams) => {
      const response = await this.request('/api/v1/markers', { method: 'POST', body: params });

      return v.parse(markersSchema, response.json);
    },

    /**
     * Requires features{@link Features['groups']}.
     */
    groupTimeline: async (groupId: string, params?: GroupTimelineParams) =>
      this.#paginatedGet(`/api/v1/timelines/group/${groupId}`, { params }, statusSchema),

    /**
     * Requires features{@link Features['bubbleTimeline']}.
     */
    bubbleTimeline: async (params?: BubbleTimelineParams) =>
      this.#paginatedGet('/api/v1/timelines/bubble', { params }, statusSchema),
  };

  public readonly lists = {
    /**
     * View your lists
     * Fetch all lists that the user owns.
     * @see {@link https://docs.joinmastodon.org/methods/lists/#get}
     */
    getLists: async () => {
      const response = await this.request('/api/v1/lists');

      return v.parse(filteredArray(listSchema), response.json);
    },

    /**
     * Show a single list
     * Fetch the list with the given ID. Used for verifying the title of a list, and which replies to show within that list.
     * @see {@link https://docs.joinmastodon.org/methods/lists/#get-one}
     */
    getList: async (listId: string) => {
      const response = await this.request(`/api/v1/lists/${listId}`);

      return v.parse(listSchema, response.json);
    },

    /**
     * Create a list
     * Create a new list.
     * @see {@link https://docs.joinmastodon.org/methods/lists/#create}
     */
    createList: async (params: CreateListParams) => {
      const response = await this.request('/api/v1/lists', { method: 'POST', body: params });

      return v.parse(listSchema, response.json);
    },

    /**
     * Update a list
     * Change the title of a list, or which replies to show.
     * @see {@link https://docs.joinmastodon.org/methods/lists/#update}
     */
    updateList: async (listId: string, params: UpdateListParams) => {
      const response = await this.request(`/api/v1/lists/${listId}`, { method: 'PUT', body: params });

      return v.parse(listSchema, response.json);
    },

    /**
     * Delete a list
     * @see {@link https://docs.joinmastodon.org/methods/lists/#delete}
     */
    deleteList: async (listId: string) => {
      const response = await this.request(`/api/v1/lists/${listId}`, { method: 'DELETE' });

      return response.json as {};
    },

    /**
     * View accounts in a list
     * @see {@link https://docs.joinmastodon.org/methods/lists/#accounts}
     */
    getListAccounts: async (listId: string, params?: GetListAccountsParams) =>
      this.#paginatedGet(`/api/v1/lists/${listId}/accounts`, { params }, accountSchema),

    /**
     * Add accounts to a list
     * Add accounts to the given list. Note that the user must be following these accounts.
     * @see {@link https://docs.joinmastodon.org/methods/lists/#accounts-add}
     */
    addListAccounts: async (listId: string, accountIds: string[]) => {
      const response = await this.request(`/api/v1/lists/${listId}/accounts`, {
        method: 'POST', body: { account_ids: accountIds },
      });

      return response.json as {};
    },

    /**
     * Remove accounts from list
     * Remove accounts from the given list.
     * @see {@link https://docs.joinmastodon.org/methods/lists/#accounts-remove}
     */
    deleteListAccounts: async (listId: string, accountIds: string[]) => {
      const response = await this.request(`/api/v1/lists/${listId}/accounts`, {
        method: 'DELETE', body: { account_ids: accountIds },
      });

      return response.json as {};
    },
  };

  public readonly streaming = {
    /**
     * Check if the server is alive
     * Verify that the streaming service is alive before connecting to it
     * @see {@link https://docs.joinmastodon.org/methods/streaming/#health}
     */
    health: async () => {
      const response = await this.request('/api/v1/streaming/health');

      return v.parse(v.literal('OK'), response.json);
    },

    /**
     * Establishing a WebSocket connection
     * Open a multiplexed WebSocket connection to receive events.
     * @see {@link https://docs.joinmastodon.org/methods/streaming/#websocket}
     */
    connect: () => {
      if (this.#socket) return this.#socket;

      const path = buildFullPath('/api/v1/streaming', this.#instance?.configuration.urls.streaming, { access_token: this.accessToken });

      const ws = new WebSocket(path, this.accessToken as any);

      let listeners: Array<{ listener: (event: StreamingEvent) => any; stream?: string }> = [];
      const queue: Array<() => any> = [];

      const enqueue = (fn: () => any) => ws.readyState === WebSocket.CONNECTING ? queue.push(fn) : fn();

      ws.onmessage = (event) => {
        const message = v.parse(streamingEventSchema, JSON.parse(event.data as string));

        listeners.filter(({ listener, stream }) => (!stream || message.stream.includes(stream)) && listener(message));
      };

      ws.onopen = () => {
        queue.forEach(fn => fn());
      };

      this.#socket = {
        listen: (listener: (event: StreamingEvent) => any, stream?: string) => listeners.push({ listener, stream }),
        unlisten: (listener: (event: StreamingEvent) => any) => listeners = listeners.filter((value) => value.listener !== listener),
        subscribe: (stream: string, { list, tag }: { list?: string; tag?: string } = {}) =>
          enqueue(() => ws.send(JSON.stringify({ type: 'subscribe', stream, list, tag }))),
        unsubscribe: (stream: string, { list, tag }: { list?: string; tag?: string } = {}) =>
          enqueue(() => ws.send(JSON.stringify({ type: 'unsubscribe', stream, list, tag }))),
        close: () => {
          ws.close();
          this.#socket = undefined;
        },
      };

      return this.#socket;
    },
  };

  public readonly notifications = {
    /**
     * Get all notifications
     * Notifications concerning the user. This API returns Link headers containing links to the next/previous page. However, the links can also be constructed dynamically using query params and `id` values.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#get}
     */
    getNotifications: async (params?: GetNotificationParams, meta?: RequestMeta) => {
      const PLEROMA_TYPES = [
        'chat_mention', 'emoji_reaction', 'report', 'participation_accepted', 'participation_request', 'event_reminder', 'event_update',
      ];

      if (params?.types) params.types = [
        ...params.types,
        ...params.types.filter(type => PLEROMA_TYPES.includes(type)).map(type => `pleroma:${type}`),
      ];

      if (params?.exclude_types) params.exclude_types = [
        ...params.exclude_types,
        ...params.exclude_types.filter(type => PLEROMA_TYPES.includes(type)).map(type => `pleroma:${type}`),
      ];

      return this.#paginatedGet('/api/v1/notifications', { ...meta, params }, notificationSchema);
    },

    /**
     * Get a single notification
     * View information about a notification with a given ID.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#get-one}
     */
    getNotification: async (notificationId: string) => {
      const response = await this.request(`/api/v1/notifications/${notificationId}`);

      return v.parse(notificationSchema, response.json);
    },

    /**
     * Dismiss all notifications
     * Clear all notifications from the server.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#clear}
     */
    dismissNotifications: async () => {
      const response = await this.request('/api/v1/notifications/clear', { method: 'POST' });

      return response.json as {};
    },

    /**
     * Dismiss a single notification
     * Dismiss a single notification from the server.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#dismiss}
     */
    dismissNotification: async (notificationId: string) => {
      const response = await this.request(`/api/v1/notifications/${notificationId}/dismiss`, { method: 'POST' });

      return response.json as {};
    },

    /**
     * Get the number of unread notification
     * Get the (capped) number of unread notifications for the current user.
     *
     * Requires features{@link Features['notificationsGetUnreadCount']}.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#unread-count}
     */
    getUnreadNotificationCount: async (params?: GetUnreadNotificationCountParams) => {
      const response = await this.request('/api/v1/notifications/unread_count', { params });

      return v.parse(v.object({
        count: v.number(),
      }), response.json);
    },

    /**
     * Get the filtering policy for notifications
     * Notifications filtering policy for the user.
     *
     * Requires features{@link Features['notificationsPolicy']}.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#get-policy}
     */
    getNotificationPolicy: async () => {
      const response = await this.request('/api/v2/notifications/policy');

      return v.parse(notificationPolicySchema, response.json);
    },

    /**
     * Update the filtering policy for notifications
     * Update the user’s notifications filtering policy.
     *
     * Requires features{@link Features['notificationsPolicy']}.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#update-the-filtering-policy-for-notifications}
     */
    updateNotificationPolicy: async (params: UpdateNotificationPolicyRequest) => {
      const response = await this.request('/api/v2/notifications/policy', { method: 'PATCH', body: params });

      return v.parse(notificationPolicySchema, response.json);
    },

    /**
     * Get all notification requests
     * Notification requests for notifications filtered by the user’s policy. This API returns Link headers containing links to the next/previous page.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#get-requests}
     */
    getNotificationRequests: async (params?: GetNotificationRequestsParams) =>
      this.#paginatedGet('/api/v1/notifications/requests', { params }, notificationRequestSchema),

    /**
     * Get a single notification request
     * View information about a notification request with a given ID.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#get-one-request}
     */
    getNotificationRequest: async (notificationRequestId: string) => {
      const response = await this.request(`/api/v1/notifications/requests/${notificationRequestId}`);

      return v.parse(notificationRequestSchema, response.json);
    },

    /**
     * Accept a single notification request
     * Accept a notification request, which merges the filtered notifications from that user back into the main notification and accepts any future notification from them.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#accept-request}
     */
    acceptNotificationRequest: async (notificationRequestId: string) => {
      const response = await this.request(`/api/v1/notifications/requests/${notificationRequestId}/dismiss`, { method: 'POST' });

      return response.json as {};
    },

    /**
     * Dismiss a single notification request
     * Dismiss a notification request, which hides it and prevent it from contributing to the pending notification requests count.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#dismiss-request}
     */
    dismissNotificationRequest: async (notificationRequestId: string) => {
      const response = await this.request(`/api/v1/notifications/requests/${notificationRequestId}/dismiss`, { method: 'POST' });

      return response.json as {};
    },

    /**
     * Accept multiple notification requests
     * Accepts multiple notification requests, which merges the filtered notifications from those users back into the main notifications and accepts any future notification from them.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#accept-multiple-requests}
     * Requires features{@link Features['notificationsRequestsAcceptMultiple']}.
     */
    acceptMultipleNotificationRequests: async (notificationRequestIds: Array<string>) => {
      const response = await this.request('/api/v1/notifications/requests/accept', { method: 'POST', body: { id: notificationRequestIds } });

      return response.json as {};
    },

    /**
     * Dismiss multiple notification requests
     * Dismiss multiple notification requests, which hides them and prevent them from contributing to the pending notification requests count.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#dismiss-multiple-requests}
     * Requires features{@link Features['notificationsRequestsAcceptMultiple']}.
     */
    dismissMultipleNotificationRequests: async (notificationRequestIds: Array<string>) => {
      const response = await this.request('/api/v1/notifications/requests/dismiss', { method: 'POST', body: { id: notificationRequestIds } });

      return response.json as {};
    },

    /**
     * Check if accepted notification requests have been merged
     * Check whether accepted notification requests have been merged. Accepting notification requests schedules a background job to merge the filtered notifications back into the normal notification list. When that process has finished, the client should refresh the notifications list at its earliest convenience. This is communicated by the `notifications_merged` streaming event but can also be polled using this endpoint.
     * @see {@link https://docs.joinmastodon.org/methods/notifications/#requests-merged}
     * Requires features{@link Features['notificationsRequestsAcceptMultiple']}.
     */
    checkNotificationRequestsMerged: async () => {
      const response = await this.request('/api/v1/notifications/requests/merged');

      return v.parse(v.object({
        merged: v.boolean(),
      }), response.json);
    },

    /**
     * An endpoint to delete multiple statuses by IDs.
     *
     * Requires features{@link Features['notificationsDismissMultiple']}.
     * @see {@link https://docs.pleroma.social/backend/development/API/differences_in_mastoapi_responses/#delete-apiv1notificationsdestroy_multiple}
     */
    dismissMultipleNotifications: async (notificationIds: string[]) => {
      const response = await this.request('/api/v1/notifications/destroy_multiple', {
        params: { ids: notificationIds },
        method: 'DELETE',
      });

      return response.json as {};
    },
  };

  /**
   * It is recommended to only use this with features{@link Features['groupedNotifications']} available. However, there is a fallback that groups the notifications client-side.
   */
  public readonly groupedNotifications = {
    /**
     * Get all grouped notifications
     * Return grouped notifications concerning the user. This API returns Link headers containing links to the next/previous page. However, the links can also be constructed dynamically using query params and `id` values.
     *
     * Requires features{@link Features['groupedNotifications']}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#get-grouped}
     */
    getGroupedNotifications: async (params: GetGroupedNotificationsParams, meta?: RequestMeta) => {
      if (this.features.groupedNotifications) {
        return this.#paginatedGet('/api/v2/notifications', { ...meta, params }, groupedNotificationsResultsSchema, false);
      } else {
        const response = await this.notifications.getNotifications(
          pick(params, ['max_id', 'since_id', 'limit', 'min_id', 'types', 'exclude_types', 'account_id', 'include_filtered']),
        );

        return this.#groupNotifications(response, params);
      }
    },

    /**
     * Get a single notification group
     * View information about a specific notification group with a given group key.
     *
     * Requires features{@link Features['groupedNotifications']}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#get-notification-group}
     */
    getNotificationGroup: async (groupKey: string) => {
      if (this.features.groupedNotifications) {
        const response = await this.request(`/api/v2/notifications/${groupKey}`);

        return v.parse(groupedNotificationsResultsSchema, response.json);
      } else {
        const response = await this.request(`/api/v1/notifications/${groupKey}`);

        return this.#groupNotifications({
          previous: null,
          next: null,
          items: [response.json],
          partial: false,
        }).items;
      }
    },

    /**
     * Dismiss a single notification group
     * Dismiss a single notification group from the server.
     *
     * Requires features{@link Features['groupedNotifications']}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#dismiss-group}
     */
    dismissNotificationGroup: async (groupKey: string) => {
      if (this.features.groupedNotifications) {
        const response = await this.request(`/api/v2/notifications/${groupKey}/dismiss`, { method: 'POST' });

        return response.json as {};
      } else {
        return this.notifications.dismissNotification(groupKey);
      }
    },

    /**
     * Get accounts of all notifications in a notification group
     *
     * Requires features{@link Features['groupedNotifications']}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#get-group-accounts}
     */
    getNotificationGroupAccounts: async (groupKey: string) => {
      if (this.features.groupedNotifications) {
        const response = await this.request(`/api/v2/notifications/${groupKey}/accounts`);

        return v.parse(filteredArray(accountSchema), response.json);
      } else {
        return (await (this.groupedNotifications.getNotificationGroup(groupKey))).accounts;
      }
    },

    /**
     * Get the number of unread notifications
     * Get the (capped) number of unread notification groups for the current user. A notification is considered unread if it is more recent than the notifications read marker. Because the count is dependant on the parameters, it is computed every time and is thus a relatively slow operation (although faster than getting the full corresponding notifications), therefore the number of returned notifications is capped.
     *
     * Requires features{@link Features['groupedNotifications']}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#unread-group-count}
     */
    getUnreadNotificationGroupCount: async (params: GetUnreadNotificationGroupCountParams) => {
      if (this.features.groupedNotifications) {
        const response = await this.request('/api/v2/notifications/unread_count', { params });

        return v.parse(v.object({
          count: v.number(),
        }), response.json);
      } else {
        return this.notifications.getUnreadNotificationCount(
          pick(params || {}, ['max_id', 'since_id', 'limit', 'min_id', 'types', 'exclude_types', 'account_id']),
        );
      }
    },
  };

  public readonly pushNotifications = {
    /**
     * Subscribe to push notifications
     * Add a Web Push API subscription to receive notifications. Each access token can have one push subscription. If you create a new subscription, the old subscription is deleted.
     * @see {@link https://docs.joinmastodon.org/methods/push/#create}
     */
    createSubscription: async (params: CreatePushNotificationsSubscriptionParams) => {
      const response = await this.request('/api/v1/push/subscription', { method: 'POST', body: params });

      return v.parse(webPushSubscriptionSchema, response.json);
    },

    /**
     * Get current subscription
     * View the PushSubscription currently associated with this access token.
     * @see {@link https://docs.joinmastodon.org/methods/push/#get}
     */
    getSubscription: async () => {
      const response = await this.request('/api/v1/push/subscription');

      return v.parse(webPushSubscriptionSchema, response.json);
    },

    /**
     * Change types of notifications
     * Updates the current push subscription. Only the data part can be updated. To change fundamentals, a new subscription must be created instead.
     * @see {@link https://docs.joinmastodon.org/methods/push/#update}
     */
    updateSubscription: async (params: UpdatePushNotificationsSubscriptionParams) => {
      const response = await this.request('/api/v1/push/subscription', { method: 'PUT', body: params });

      return v.parse(webPushSubscriptionSchema, response.json);
    },

    /**
     * Remove current subscription
     * Removes the current Web Push API subscription.
     * @see {@link https://docs.joinmastodon.org/methods/push/#delete}
     */
    deleteSubscription: async () => {
      const response = await this.request('/api/v1/push/subscription', { method: 'DELETE' });

      return response.json as {};
    },
  };

  public readonly search = {
    /**
     * Perform a search
     * @see {@link https://docs.joinmastodon.org/methods/search/#v2}
     */
    search: async (q: string, params?: SearchParams, meta?: RequestMeta) => {
      const response = await this.request('/api/v2/search', { ...meta, params: { ...params, q } });

      return v.parse(searchSchema, response.json);
    },

    /**
     * Searches for locations
     *
     * Requires features{@link Features['events']}.
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#apiv1pleromasearchlocation}
     */
    searchLocation: async (q: string, meta?: RequestMeta) => {
      const response = await this.request('/api/v1/pleroma/search/location', { ...meta, params: { q } });

      return v.parse(filteredArray(locationSchema), response.json);
    },
  };

  public readonly instance = {
    /**
     * View server information
     * Obtain general information about the server.
     * @see {@link https://docs.joinmastodon.org/methods/instance/#v2}
     */
    getInstance: async () => {
      let response;
      try {
        response = await this.request('/api/v2/instance');
      } catch (e) {
        response = await this.request('/api/v1/instance');
      }

      const instance = v.parse(v.pipe(instanceSchema, v.readonly()), response.json);
      this.#setInstance(instance);

      return instance;
    },

    /**
     * List of connected domains
     * Domains that this instance is aware of.
     * @see {@link https://docs.joinmastodon.org/methods/instance/#peers}
     */
    getInstancePeers: async () => {
      const response = await this.request('/api/v1/instance/peers');

      return v.parse(v.array(v.string()), response.json);
    },

    /**
     * Weekly activity
     * Instance activity over the last 3 months, binned weekly.
     * @see {@link https://docs.joinmastodon.org/methods/instance/#activity}
     */
    getInstanceActivity: async () => {
      const response = await this.request('/api/v1/instance/activity');

      return v.parse(v.array(v.object({
        week: v.string(),
        statuses: v.pipe(v.unknown(), v.transform(String)),
        logins: v.pipe(v.unknown(), v.transform(String)),
        registrations: v.pipe(v.unknown(), v.transform(String)),
      })), response.json);
    },

    /**
     * List of rules
     * Rules that the users of this service should follow.
     * @see {@link https://docs.joinmastodon.org/methods/instance/#rules}
     */
    getInstanceRules: async () => {
      const response = await this.request('/api/v1/instance/rules');

      return v.parse(filteredArray(ruleSchema), response.json);
    },

    /**
     * View moderated servers
     * Obtain a list of domains that have been blocked.
     * @see {@link https://docs.joinmastodon.org/methods/instance/#domain_blocks}
     */
    getInstanceDomainBlocks: async () => {
      const response = await this.request('/api/v1/instance/rules');

      return v.parse(filteredArray(domainBlockSchema), response.json);
    },

    /**
     * View extended description
     * Obtain an extended description of this server
     * @see {@link https://docs.joinmastodon.org/methods/instance/#extended_description}
     */
    getInstanceExtendedDescription: async () => {
      const response = await this.request('/api/v1/instance/extended_description');

      return v.parse(extendedDescriptionSchema, response.json);
    },

    /**
     * View translation languages
     * Translation language pairs supported by the translation engine used by the server.
     * @see {@link https://docs.joinmastodon.org/methods/instance/#translation_languages}
     */
    getInstanceTranslationLanguages: async () => {
      if (this.features.version.build === AKKOMA) {
        const response = await this.request<{
          source: Array<{ code: string; name: string }>;
          target: Array<{ code: string; name: string }>;
        }>('/api/v1/akkoma/translation/languages');

        return Object.fromEntries(response.json.source.map(source => [
          source.code.toLocaleLowerCase(),
          response.json.target.map(lang => lang.code).filter(lang => lang !== source.code).map(lang => lang.toLocaleLowerCase()),
        ]));
      }

      const response = await this.request('/api/v1/instance/translation_languages');

      return v.parse(v.record(v.string(), v.array(v.string())), response.json);
    },

    /**
     * View profile directory
     * List accounts visible in the directory.
     * @see {@link https://docs.joinmastodon.org/methods/directory/#get}
     */
    profileDirectory: async (params?: ProfileDirectoryParams) => {
      const response = await this.request('/api/v1/directory', { params });

      return v.parse(filteredArray(accountSchema), response.json);
    },

    /**
     * View all custom emoji
     * Returns custom emojis that are available on the server.
     * @see {@link https://docs.joinmastodon.org/methods/custom_emojis/#get}
     */
    getCustomEmojis: async () => {
      const response = await this.request('/api/v1/custom_emojis');

      return v.parse(filteredArray(customEmojiSchema), response.json);
    },

    /**
     * Dump frontend configurations
     *
     * Requires features{@link Features['frontendConfigurations']}.
     */
    getFrontendConfigurations: async () => {
      const response = await this.request('/api/pleroma/frontend_configurations');

      return v.parse(v.fallback(v.record(v.string(), v.record(v.string(), v.any())), {}), response.json);
    },
  };

  public readonly trends = {
    /**
     * View trending tags
     * Tags that are being used more frequently within the past week.
     * @see {@link https://docs.joinmastodon.org/methods/trends/#tags}
     */
    getTrendingTags: async (params?: GetTrendingTags) => {
      const response = await this.request('/api/v1/trends/tags', { params });

      return v.parse(filteredArray(tagSchema), response.json);
    },

    /**
     * View trending statuses
     * Statuses that have been interacted with more than others.
     * @see {@link https://docs.joinmastodon.org/methods/trends/#statuses}
     */
    getTrendingStatuses: async (params?: GetTrendingStatuses) => {
      const response = await this.request('/api/v1/trends/statuses', { params });

      return v.parse(filteredArray(statusSchema), response.json);
    },

    /**
     * View trending links
     * Links that have been shared more than others.
     * @see {@link https://docs.joinmastodon.org/methods/trends/#links}
     */
    getTrendingLinks: async (params?: GetTrendingLinks) => {
      const response = await this.request('/api/v1/trends/links', { params });

      return v.parse(filteredArray(trendsLinkSchema), response.json);
    },
  };

  public readonly announcements = {
    /**
     * View all announcements
     * See all currently active announcements set by admins.
     * @see {@link https://docs.joinmastodon.org/methods/announcements/#get}
     */
    getAnnouncements: async () => {
      const response = await this.request('/api/v1/announcements');

      return v.parse(filteredArray(announcementSchema), response.json);
    },

    /**
     * Dismiss an announcement
     * Allows a user to mark the announcement as read.
     * @see {@link https://docs.joinmastodon.org/methods/announcements/#dismiss}
     */
    dismissAnnouncements: async (announcementId: string) => {
      const response = await this.request(`/api/v1/announcements/${announcementId}`, { method: 'POST' });

      return response.json as {};
    },

    /**
     * Add a reaction to an announcement
     * React to an announcement with an emoji.
     * @see {@link https://docs.joinmastodon.org/methods/announcements/#put-reactions}
     */
    addAnnouncementReaction: async (announcementId: string, emoji: string) => {
      const response = await this.request(`/api/v1/announcements/${announcementId}/reactions/${emoji}`, { method: 'PUT' });

      return response.json as {};
    },

    /**
     * Remove a reaction from an announcement
     * Undo a react emoji to an announcement.
     * @see {@link https://docs.joinmastodon.org/methods/announcements/#delete-reactions}
     */
    deleteAnnouncementReaction: async (announcementId: string, emoji: string) => {
      const response = await this.request(`/api/v1/announcements/${announcementId}/reactions/${emoji}`, { method: 'DELETE' });

      return response.json as {};
    },
  };

  public readonly admin = {
    /** Perform moderation actions with accounts. */
    accounts: {
      /**
       * View accounts
       * View all accounts, optionally matching certain criteria for filtering, up to 100 at a time.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#v2}
       */
      getAccounts: async (params?: AdminGetAccountsParams) => {
        if (this.features.mastodonAdminV2) {
          return this.#paginatedGet('/api/v2/admin/accounts', { params }, adminAccountSchema);
        } else {
          return this.#paginatedPleromaAccounts(params ? {
            query: params.username,
            name: params.display_name,
            email: params.email,
            filters: [
              params.origin === 'local' && 'local',
              params.origin === 'remote' && 'external',
              params.status === 'active' && 'active',
              params.status === 'pending' && 'need_approval',
              params.status === 'disabled' && 'deactivated',
              params.permissions === 'staff' && 'is_admin',
              params.permissions === 'staff' && 'is_moderator',
            ].filter(filter => filter).join(','),
            page_size: 100,
          } : { page_size: 100 });
        }
      },

      /**
       * View a specific account
       * View admin-level information about the given account.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#get-one}
       */
      getAccount: async (accountId: string) => {
        let response;

        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/accounts/${accountId}`);
        } else {
          response = await this.request(`/api/v1/admin/users/${accountId}`);
        }

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Approve a pending account
       * Approve the given local account if it is currently pending approval.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#approve}
       */
      approveAccount: async (accountId: string) => {
        let response;

        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/accounts/${accountId}/approve`, { method: 'POST' });
        } else {
          const account = await this.admin.accounts.getAccount(accountId)!;

          response = await this.request('/api/v1/pleroma/admin/users/approve', { body: { nicknames: [account.account!.username] } });
          response.json = response.json?.users?.[0];
        }

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Reject a pending account
       * Reject the given local account if it is currently pending approval.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#reject}
       */
      rejectAccount: async (accountId: string) => {
        let response;

        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/accounts/${accountId}/reject`, { method: 'POST' });
        } else {
          const account = await this.admin.accounts.getAccount(accountId)!;

          response = await this.request('/api/v1/pleroma/admin/users/approve', { body: {
            method: 'DELETE',
            nicknames: [account.account!.username],
          } });
        }

        return v.safeParse(adminAccountSchema, response.json).output || {};
      },

      /**
       * Delete an account
       * Permanently delete data for a suspended account.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#delete}
       */
      deleteAccount: async (accountId: string) => {
        const response = await this.request(`/api/v1/admin/accounts/${accountId}`, { method: 'DELETE' });

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Perform an action against an account
       * Perform an action against an account and log this action in the moderation history. Also resolves any open reports against this account.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#action}
       */
      performAccountAction: async (accountId: string, type: AdminAccountAction, params?: AdminPerformAccountActionParams) => {
        let response;

        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/accounts/${accountId}/action`, { body: { ...params, type } });
        } else {
          const account = await this.admin.accounts.getAccount(accountId)!;

          switch (type) {
            case 'disable':
            case 'suspend':
              response = await this.request('/api/v1/pleroma/admin/users/deactivate', { body: { nicknames: [account.account!.username] } });
              break;
            default:
              response = { json: {} };
              break;
          }
          if (params?.report_id) await this.admin.reports.resolveReport(params.report_id);
        }

        return response.json as {};
      },

      /**
       * Enable a currently disabled account
       * Re-enable a local account whose login is currently disabled.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#enable}
       */
      enableAccount: async (accountId: string) => {
        let response;

        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/accounts/${accountId}/enable`, { method: 'POST' });
        } else {
          const account = await this.admin.accounts.getAccount(accountId)!;

          response = await this.request('/api/v1/pleroma/admin/users/activate', { body: { nicknames: [account.account!.username] } });
          response.json = response.json?.users?.[0];
        }

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Unsilence an account
       * Unsilence an account if it is currently silenced.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#unsilence}
       */
      unsilenceAccount: async (accountId: string) => {
        const response = await this.request(`/api/v1/admin/accounts/${accountId}/unsilence`, { method: 'POST' });

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Unsuspend an account
       * Unsuspend a currently suspended account.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#unsuspend}
       */
      unsuspendAccount: async (accountId: string) => {
        let response;

        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/accounts/${accountId}/unsuspend`, { method: 'POST' });
        } else {
          const { account } = await this.admin.accounts.getAccount(accountId)!;

          response = await this.request('/api/v1/pleroma/admin/users/activate', { body: { nicknames: [account!.acct] } });
          response.json = response.json?.users?.[0];
        }

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Unmark an account as sensitive
       * Stops marking an account’s posts as sensitive, if it was previously flagged as sensitive.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#unsensitive}
       */
      unsensitiveAccount: async (accountId: string) => {
        const response = await this.request(`/api/v1/admin/accounts/${accountId}/unsensitive`, { method: 'POST' });

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Requires features{@link Features['pleromaAdminAccounts']}.
       */
      promoteToAdmin: async (accountId: string) => {
        const { account } = await this.admin.accounts.getAccount(accountId)!;

        await this.request('/api/v1/pleroma/admin/users/permission_group/moderator', {
          method: 'DELETE',
          body: { nicknames: [account!.acct] },
        });
        const response = await this.request('/api/v1/pleroma/admin/users/permission_group/admin', {
          method: 'POST',
          body: { nicknames: [account!.acct] },
        });

        return response.json as {};
      },

      /**
       * Requires features{@link Features['pleromaAdminAccounts']}.
       */
      promoteToModerator: async (accountId: string) => {
        const { account } = await this.admin.accounts.getAccount(accountId)!;

        await this.request('/api/v1/pleroma/admin/users/permission_group/admin', {
          method: 'DELETE', body: { nicknames: [account!.acct] } });
        const response = await this.request('/api/v1/pleroma/admin/users/permission_group/moderator', {
          method: 'POST', body: { nicknames: [account!.acct] } });

        return response.json as {};
      },

      /**
       * Requires features{@link Features['pleromaAdminAccounts']}.
       */
      demoteToUser: async (accountId: string) => {
        const { account } = await this.admin.accounts.getAccount(accountId)!;

        await this.request('/api/v1/pleroma/admin/users/permission_group/moderator', {
          method: 'DELETE',
          body: { nicknames: [account!.acct] },
        });
        const response = await this.request('/api/v1/pleroma/admin/users/permission_group/admin', {
          method: 'DELETE',
          body: { nicknames: [account!.acct] },
        });

        return response.json as {};
      },

      /**
       * Tag a user.
       *
       * Requires features{@link Features['pleromaAdminAccounts']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#patch-apiv1pleromaadminuserssuggest}
       */
      suggestUser: async (accountId: string) => {
        const { account } = await this.admin.accounts.getAccount(accountId)!;

        const response = await this.request('/api/v1/pleroma/admin/users/suggest', {
          method: 'PATCH',
          body: { nicknames: [account!.acct] },
        });

        return response.json as {};
      },

      /**
       * Untag a user.
       *
       * Requires features{@link Features['pleromaAdminAccounts']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#patch-apiv1pleromaadminusersunsuggest}
       */
      unsuggestUser: async (accountId: string) => {
        const { account } = await this.admin.accounts.getAccount(accountId)!;

        const response = await this.request('/api/v1/pleroma/admin/users/unsuggest', {
          method: 'PATCH',
          body: { nicknames: [account!.acct] },
        });

        return response.json as {};
      },

      /**
       * Tag a user.
       *
       * Requires features{@link Features['pleromaAdminAccounts']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#put-apiv1pleromaadminuserstag}
       */
      tagUser: async (accountId: string, tags: Array<string>) => {
        const { account } = await this.admin.accounts.getAccount(accountId)!;

        const response = await this.request('/api/v1/pleroma/admin/users/tag', {
          method: 'PUT',
          body: { nicknames: [account!.acct], tags },
        });

        return response.json as {};
      },

      /**
       * Untag a user.
       *
       * Requires features{@link Features['pleromaAdminAccounts']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminuserstag}
       */
      untagUser: async (accountId: string, tags: Array<string>) => {
        const { account } = await this.admin.accounts.getAccount(accountId)!;

        const response = await this.request('/api/v1/pleroma/admin/users/tag', {
          method: 'DELETE',
          body: { nicknames: [account!.acct], tags },
        });

        return response.json as {};
      },
    },

    /** Disallow certain domains to federate. */
    domainBlocks: {
      /**
       * List all blocked domains
       * Show information about all blocked domains.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#get}
       */
      getDomainBlocks: (params?: AdminGetDomainBlocksParams) =>
        this.#paginatedGet('/api/v1/admin/domain_blocks', { params }, adminDomainBlockSchema),

      /**
       * Get a single blocked domain
       * Show information about a single blocked domain.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#get-one}
       */
      getDomainBlock: async (domainBlockId: string) => {
        const response = await this.request(`/api/v1/admin/domain_blocks/${domainBlockId}`);

        return v.parse(adminDomainBlockSchema, response.json);
      },

      /**
       * Block a domain from federating
       * Add a domain to the list of domains blocked from federating.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#create}
       */
      createDomainBlock: async (domain: string, params?: AdminCreateDomainBlockParams) => {
        const response = await this.request('/api/v1/admin/domain_blocks', {
          method: 'POST',
          body: { ...params, domain },
        });

        return v.parse(adminDomainBlockSchema, response.json);
      },

      /**
       * Update a domain block
       * Change parameters for an existing domain block.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#update}
       */
      updateDomainBlock: async (domainBlockId: string, params?: AdminUpdateDomainBlockParams) => {
        const response = await this.request(`/api/v1/admin/domain_blocks/${domainBlockId}`, {
          method: 'PUT',
          body: params,
        });

        return v.parse(adminDomainBlockSchema, response.json);
      },

      /**
       * Remove a domain block
       * Lift a block against a domain.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#delete}
       */
      deleteDomainBlock: async (domainBlockId: string) => {
        const response = await this.request(`/api/v1/admin/domain_blocks/${domainBlockId}`, {
          method: 'DELETE',
        });

        return response.json as {};
      },
    },

    /** Perform moderation actions with reports. */
    reports: {
      /**
       * View all reports
       * View information about all reports.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#get}
       */
      getReports: async (params?: AdminGetReportsParams) => {
        if (this.features.mastodonAdmin) {
          return this.#paginatedGet('/api/v1/admin/reports', { params }, adminReportSchema);
        } else {
          return this.#paginatedPleromaReports({
            state: params?.resolved === true ? 'resolved' : params?.resolved === false ? 'open' : undefined,
            page_size: params?.limit || 100,
          });
        }
      },

      /**
       * View a single report
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#get-one}
       */
      getReport: async (reportId: string) => {
        let response;
        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/reports/${reportId}`);
        } else {
          response = await this.request(`/api/v1/pleroma/admin/reports/${reportId}`);
        }

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Update a report
       * Change metadata for a report.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#update}
       */
      updateReport: async (reportId: string, params: AdminUpdateReportParams) => {
        const response = await this.request(`/api/v1/admin/reports/${reportId}`, { method: 'PUT', body: params });

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Assign report to self
       * Claim the handling of this report to yourself.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#assign_to_self}
       */
      assignReportToSelf: async (reportId: string) => {
        const response = await this.request(`/api/v1/admin/reports/${reportId}/assign_to_self`, { method: 'POST' });

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Unassign report
       * Unassign a report so that someone else can claim it.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#unassign}
       */
      unassignReport: async (reportId: string) => {
        const response = await this.request(`/api/v1/admin/reports/${reportId}/unassign`, { method: 'POST' });

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Mark report as resolved
       * Mark a report as resolved with no further action taken.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#resolve}
       */
      resolveReport: async (reportId: string) => {
        let response;
        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/reports/${reportId}/resolve`, { method: 'POST' });
        } else {
          response = await this.request(`/api/v1/pleroma/admin/reports/${reportId}`, {
            method: 'PATCH',
            body: { reports: [{ id: reportId, state: 'resolved' }] },
          });
        }

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Reopen a closed report
       * Reopen a currently closed report, if it is closed.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#reopen}
       */
      reopenReport: async (reportId: string) => {
        let response;
        if (this.features.mastodonAdmin) {
          response = await this.request(`/api/v1/admin/reports/${reportId}/reopen`, { method: 'POST' });
        } else {
          response = await this.request(`/api/v1/pleroma/admin/reports/${reportId}`, {
            method: 'PATCH',
            body: { reports: [{ id: reportId, state: 'open' }] },
          });
        }

        return v.parse(adminReportSchema, response.json);
      },
    },

    statuses: {
      /**
       * @param params Retrieves all latest statuses
       *
       * The params are subject to change in case Mastodon implements alike route.
       *
       * Requires features{@link Features['pleromaAdminStatuses']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminstatuses}
       */
      getStatuses: async (params?: AdminGetStatusesParams) => this.#paginatedPleromaStatuses({
        page_size: params?.limit || 100,
        page: 1,
        local_only: params?.local_only,
        with_reblogs: params?.with_reblogs,
        godmode: params?.with_private,
      }),

      /**
       * Show status by id
       *
       * Requires features{@link Features['pleromaAdminStatuses']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminstatusesid}
      */
      getStatus: async (statusId: string) => {
        const response = await this.request(`/api/v1/pleroma/admin/statuses/${statusId}`);

        return v.parse(statusSchema, response.json);
      },

      /**
       * Change the scope of an individual reported status
       *
       * Requires features{@link Features['pleromaAdminStatuses']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#put-apiv1pleromaadminstatusesid}
       */
      updateStatus: async (statusId: string, params: AdminUpdateStatusParams) => {
        const response = await this.request(`/api/v1/pleroma/admin/statuses/${statusId}`, { method: 'PUT', body: params });

        return v.parse(statusSchema, response.json);
      },

      /**
       * Delete an individual reported status
       *
       * Requires features{@link Features['pleromaAdminStatuses']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminstatusesid}
       */
      deleteStatus: async (statusId: string) => {
        const response = await this.request(`/api/v1/pleroma/admin/statuses/${statusId}`, { method: 'DELETE' });

        return response.json as {};
      },
    },

    trends: {
      /**
       * View trending links
       * Links that have been shared more than others, including unapproved and unreviewed links.
       * @see {@link https://docs.joinmastodon.org/methods/admin/trends/#links}
       */
      getTrendingLinks: async () => {
        const response = await this.request('/api/v1/admin/trends/links');

        return v.parse(filteredArray(trendsLinkSchema), response.json);
      },

      /**
       * View trending statuses
       * Statuses that have been interacted with more than others, including unapproved and unreviewed statuses.
       * @see {@link https://docs.joinmastodon.org/methods/admin/trends/#statuses}
       */
      getTrendingStatuses: async () => {
        const response = await this.request('/api/v1/admin/trends/statuses');

        return v.parse(filteredArray(statusSchema), response.json);
      },

      /**
       * View trending tags
       * Tags that are being used more frequently within the past week, including unapproved and unreviewed tags.
       * @see {@link https://docs.joinmastodon.org/methods/admin/trends/#tags}
       */
      getTrendingTags: async () => {
        const response = await this.request('/api/v1/admin/trends/links');

        return v.parse(filteredArray(adminTagSchema), response.json);
      },
    },

    /** Block certain email addresses by their hash. */
    canonicalEmailBlocks: {
      /**
       * List all canonical email blocks
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#get}
       */
      getCanonicalEmailBlocks: async (params?: AdminGetCanonicalEmailBlocks) =>
        this.#paginatedGet('/api/v1/admin/canonical_email_blocks', { params }, adminCanonicalEmailBlockSchema),

      /**
       * Show a single canonical email block
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#get-one}
       */
      getCanonicalEmailBlock: async (canonicalEmailBlockId: string) => {
        const response = await this.request(`/api/v1/admin/canonical_email_blocks/${canonicalEmailBlockId}`);

        return v.parse(adminCanonicalEmailBlockSchema, response.json);
      },

      /**
       * Test
       * Canoniocalize and hash an email address.
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#test}
       */
      testCanonicalEmailBlock: async (email: string) => {
        const response = await this.request('/api/v1/admin/canonical_email_blocks/test', { method: 'POST', body: { email } });

        return v.parse(filteredArray(adminCanonicalEmailBlockSchema), response.json);
      },

      /**
       * Block a canonical email
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#create}
       */
      createCanonicalEmailBlock: async (email: string, canonical_email_hash?: string) => {
        const response = await this.request('/api/v1/admin/canonical_email_blocks', { method: 'POST', body: { email, canonical_email_hash } });

        return v.parse(filteredArray(adminCanonicalEmailBlockSchema), response.json);
      },

      /**
       * Delete a canonical email block
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#delete}
       */
      deleteCanonicalEmailBlock: async (canonicalEmailBlockId: string) => {
        const response = await this.request(`/api/v1/admin/canonical_email_blocks/${canonicalEmailBlockId}`, { method: 'DELETE' });

        return response.json as {};
      },
    },

    /** Obtain qualitative metrics about the server. */
    dimensions: {
      /**
       * Get dimensional data
       * Obtain information about popularity of certain accounts, servers, languages, etc.
       * @see {@link https://docs.joinmastodon.org/methods/admin/dimensions/#get}
       */
      getDimensions: async (keys: AdminDimensionKey[], params?: AdminGetDimensionsParams) => {
        const response = await this.request('/api/v1/admin/dimensions', { params: { ...params, keys } });

        return v.parse(filteredArray(adminDimensionSchema), response.json);
      },
    },

    /** Allow certain domains to federate. */
    domainAllows: {
      /**
       * List all allowed domains
       * Show information about all allowed domains.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_allows/#get}
       */
      getDomainAllows: (params?: AdminGetDomainAllowsParams) =>
        this.#paginatedGet('/api/v1/admin/domain_allows', { params }, adminDomainAllowSchema),

      /**
       * Get a single allowed domain
       * Show information about a single allowed domain.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_allows/#get-one}
       */
      getDomainAllow: async (domainAllowId: string) => {
        const response = await this.request(`/api/v1/admin/domain_allows/${domainAllowId}`);

        return v.parse(adminDomainAllowSchema, response.json);
      },

      /**
       * Allow a domain to federate
       * Add a domain to the list of domains allowed to federate, to be used when the instance is in allow-list federation mode.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_allows/#create}
       */
      createDomainAllow: async (domain: string) => {
        const response = await this.request('/api/v1/admin/domain_allows', { method: 'POST', body: { domain } });

        return v.parse(adminDomainAllowSchema, response.json);
      },

      /**
       * Delete an allowed domain
       * Delete a domain from the allowed domains list.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_allows/#delete}
       */
      deleteDomainAllow: async (domainAllowId: string) => {
        const response = await this.request(`/api/v1/admin/domain_allows/${domainAllowId}`, { method: 'DELETE' });

        return response.json as {};
      },
    },

    /** Disallow certain email domains from signing up. */
    emailDomainBlocks: {
      /**
       * List all blocked email domains
       * Show information about all email domains blocked from signing up.
       * @see {@link https://docs.joinmastodon.org/methods/admin/email_domain_blocks/#get}
       */
      getEmailDomainBlocks: (params?: AdminGetEmailDomainBlocksParams) =>
        this.#paginatedGet('/api/v1/admin/email_domain_blocks', { params }, adminEmailDomainBlockSchema),

      /**
       * Get a single blocked email domain
       * Show information about a single email domain that is blocked from signups.
       * @see {@link https://docs.joinmastodon.org/methods/admin/email_domain_blocks/#get-one}
       */
      getEmailDomainBlock: async (emailDomainBlockId: string) => {
        const response = await this.request(`/api/v1/admin/email_domain_blocks/${emailDomainBlockId}`);

        return v.parse(adminEmailDomainBlockSchema, response.json);
      },

      /**
       * Block an email domain from signups
       * Add a domain to the list of email domains blocked from signups.
       * @see {@link https://docs.joinmastodon.org/methods/admin/email_domain_blocks/#create}
       */
      createEmailDomainBlock: async (domain: string) => {
        const response = await this.request('/api/v1/admin/email_domain_blocks', { method: 'POST', body: { domain } });

        return v.parse(adminEmailDomainBlockSchema, response.json);
      },

      /**
       * Delete an email domain block
       * Lift a block against an email domain.
       * @see {@link https://docs.joinmastodon.org/methods/admin/email_domain_blocks/#delete}
       */
      deleteEmailDomainBlock: async (emailDomainBlockId: string) => {
        const response = await this.request(`/api/v1/admin/email_domain_blocks/${emailDomainBlockId}`, { method: 'DELETE' });

        return response.json as {};
      },
    },

    /** Disallow certain IP address ranges from signing up. */
    ipBlocks: {
      /**
       * List all IP blocks
       * Show information about all blocked IP ranges.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#get}
       */
      getIpBlocks: (params?: AdminGetIpBlocksParams) =>
        this.#paginatedGet('/api/v1/admin/ip_blocks', { params }, adminIpBlockSchema),

      /**
       * Get a single IP block
       * Show information about a single IP block.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#get-one}
       */
      getIpBlock: async (ipBlockId: string) => {
        const response = await this.request(`/api/v1/admin/ip_blocks/${ipBlockId}`);

        return v.parse(adminIpBlockSchema, response.json);
      },

      /**
       * Block an IP address range from signing up
       * Add an IP address range to the list of IP blocks.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#create}
       */
      createIpBlock: async (params: AdminCreateIpBlockParams) => {
        const response = await this.request('/api/v1/admin/ip_blocks', { method: 'POST', body: params });

        return v.parse(adminIpBlockSchema, response.json);
      },

      /**
       * Update a domain block
       * Change parameters for an existing IP block.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#update}
       */
      updateIpBlock: async (ipBlockId: string, params: AdminCreateIpBlockParams) => {
        const response = await this.request(`/api/v1/admin/ip_blocks/${ipBlockId}`, { method: 'POST', body: params });

        return v.parse(adminIpBlockSchema, response.json);
      },

      /**
       * Delete an IP block
       * Lift a block against an IP range.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#delete}
       */
      deleteIpBlock: async (ipBlockId: string) => {
        const response = await this.request(`/api/v1/admin/ip_blocks/${ipBlockId}`, { method: 'DELETE' });

        return response.json as {};
      },
    },

    /** Obtain quantitative metrics about the server. */
    measures: {
      /**
       * Get measurable data
       * Obtain quantitative metrics about the server.
       * @see {@link https://docs.joinmastodon.org/methods/admin/measures/#get}
       */
      getMeasures: async (keys: AdminMeasureKey[], start_at: string, end_at: string, params?: AdminGetMeasuresParams) => {
        const response = await this.request('/api/v1/admin/measures', { params: { ...params, keys, start_at, end_at } });

        return v.parse(filteredArray(adminMeasureSchema), response.json);
      },
    },

    /** Show retention data over time. */
    retention: {
      /**
       * Calculate retention data
       *
       * Generate a retention data report for a given time period and bucket.
       * @see {@link https://docs.joinmastodon.org/methods/admin/retention/#create}
       */
      getRetention: async (start_at: string, end_at: string, frequency: 'day' | 'month') => {
        const response = await this.request('/api/v1/admin/retention', { params: { start_at, end_at, frequency } });

        return v.parse(adminCohortSchema, response.json);
      },
    },

    announcements: {
      /**
       * List announcements
       *
       * Requires features{@link Features['pleromaAdminAnnouncements']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminannouncements}
       */
      getAnnouncements: async (params?: AdminGetAnnouncementsParams): Promise<PaginatedResponse<AdminAnnouncement>> => {
        const response = await this.request('/api/v1/pleroma/admin/announcements', { params });

        const items = v.parse(filteredArray(adminAnnouncementSchema), response.json);

        return {
          previous: null,
          next: items.length ? () => this.admin.announcements.getAnnouncements({ ...params, offset: (params?.offset || 0) + items.length }) : null,
          items,
          partial: false,
        };
      },

      /**
       * Display one announcement
       *
       * Requires features{@link Features['pleromaAdminAnnouncements']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminannouncementsid}
       */
      getAnnouncement: async (announcementId: string) => {
        const response = await this.request(`/api/v1/pleroma/admin/announcements/${announcementId}`);

        return v.parse(adminAnnouncementSchema, response.json);
      },

      /**
       * Create an announcement
       *
       * Requires features{@link Features['pleromaAdminAnnouncements']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#post-apiv1pleromaadminannouncements}
       */
      createAnnouncement: async (params: AdminCreateAnnouncementParams) => {
        const response = await this.request('/api/v1/pleroma/admin/announcements', { method: 'POST', body: params });

        return v.parse(adminAnnouncementSchema, response.json);
      },

      /**
       * Change an announcement
       *
       * Requires features{@link Features['pleromaAdminAnnouncements']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#patch-apiv1pleromaadminannouncementsid}
       */
      updateAnnouncement: async (announcementId: string, params: AdminUpdateAnnouncementParams) => {
        const response = await this.request(`/api/v1/pleroma/admin/announcements/${announcementId}`, { method: 'PATCH', body: params });

        return v.parse(adminAnnouncementSchema, response.json);
      },

      /**
       * Delete an announcement
       *
       * Requires features{@link Features['pleromaAdminAnnouncements']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminannouncementsid}
       */
      deleteAnnouncement: async (announcementId: string) => {
        const response = await this.request(`/api/v1/pleroma/admin/announcements/${announcementId}`, { method: 'DELETE' });

        return response.json as {};
      },
    },

    domains: {
      /**
       * List of domains
       *
       * Requires features{@link Features['domains']}.
       */
      getDomains: async () => {
        const response = await this.request('/api/v1/pleroma/admin/domains');

        return v.parse(filteredArray(adminDomainSchema), response.json);
      },

      /**
       * Create a domain
       *
       * Requires features{@link Features['domains']}.
       */
      createDomain: async (params: AdminCreateDomainParams) => {
        const response = await this.request('/api/v1/pleroma/admin/domains', { method: 'POST', body: params });

        return v.parse(adminDomainSchema, response.json);
      },

      /**
       * Change domain publicity
       *
       * Requires features{@link Features['domains']}.
       */
      updateDomain: async (domainId: string, isPublic: boolean) => {
        const response = await this.request(`/api/v1/pleroma/admin/domains/${domainId}`, { method: 'PATCH', body: { public: isPublic } });

        return v.parse(adminDomainSchema, response.json);
      },

      /**
       * Delete a domain
       *
       * Requires features{@link Features['domains']}.
       */
      deleteDomain: async (domainId: string) => {
        const response = await this.request(`/api/v1/pleroma/admin/domains/${domainId}`, { method: 'DELETE' });

        return response.json as {};
      },
    },

    moderationLog: {
      /**
       * Get moderation log
       *
       * Requires features{@link Features['pleromaAdminModerationLog']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminmoderation_log}
      */
      getModerationLog: async ({ limit, ...params }: AdminGetModerationLogParams = {}): Promise<PaginatedResponse<AdminModerationLogEntry>> => {
        const response = await this.request('/api/v1/pleroma/admin/moderation_log', { params: { page_size: limit, ...params } });

        const items = v.parse(filteredArray(adminModerationLogEntrySchema), response.json.items);

        return {
          previous: (params.page && params.page > 1) ? () => this.admin.moderationLog.getModerationLog({ ...params, page: params.page! - 1 }) : null,
          next: response.json.total > (params.page || 1) * (limit || 50) ? () => this.admin.moderationLog.getModerationLog({ ...params, page: (params.page || 1) + 1 }) : null,
          items,
          partial: response.status === 206,
        };
      },
    },

    relays: {
      /**
       * List Relays
       *
       * Requires features{@link Features['pleromaAdminRelays']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminrelay}
       */
      getRelays: async () => {
        const response = await this.request('/api/v1/pleroma/admin/relay');

        return v.parse(filteredArray(adminRelaySchema), response.json);
      },

      /**
       * Follow a Relay
       *
       * Requires features{@link Features['pleromaAdminRelays']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#post-apiv1pleromaadminrelay}
       */
      followRelay: async (relayUrl: string) => {
        const response = await this.request('/api/v1/pleroma/admin/relay', { method: 'POST', body: { relay_url: relayUrl } });

        return v.parse(adminRelaySchema, response.json);
      },

      /**
       * Unfollow a Relay
       *
       * Requires features{@link Features['pleromaAdminRelays']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminrelay}
       */
      unfollowRelay: async (relayUrl: string, force = false) => {
        const response = await this.request('/api/v1/pleroma/admin/relay', { method: 'DELETE', body: { relay_url: relayUrl, force } });

        return v.parse(adminRelaySchema, response.json);
      },
    },

    rules: {
      /**
       * List rules
       *
       * Requires features{@link Features['pleromaAdminRules']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminrules}
       */
      getRules: async () => {
        const response = await this.request('/api/v1/pleroma/admin/rules');

        return v.parse(filteredArray(adminRuleSchema), response.json);
      },

      /**
       * Create a rule
       *
       * Requires features{@link Features['pleromaAdminRules']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#post-apiv1pleromaadminrules}
       */
      createRule: async (params: AdminCreateRuleParams) => {
        const response = await this.request('/api/v1/pleroma/admin/rules', { method: 'POST', body: params });

        return v.parse(adminRuleSchema, response.json);
      },

      /**
       * Update a rule
       *
       * Requires features{@link Features['pleromaAdminRules']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#patch-apiv1pleromaadminrulesid}
       */
      updateRule: async (ruleId: string, params: AdminUpdateRuleParams) => {
        const response = await this.request(`/api/v1/pleroma/admin/rules/${ruleId}`, { method: 'PATCH', body: params });

        return v.parse(adminRuleSchema, response.json);
      },

      /**
       * Delete a rule
       *
       * Requires features{@link Features['pleromaAdminRules']}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminrulesid}
       */
      deleteRule: async (ruleId: string) => {
        const response = await this.request(`/api/v1/pleroma/admin/rules/${ruleId}`, { method: 'DELETE' });

        return response.json as {};
      },
    },

    config: {
      getPleromaConfig: async () => {
        const response = await this.request('/api/v1/pleroma/admin/config');

        return v.parse(pleromaConfigSchema, response.json);
      },

      updatePleromaConfig: async (params: PleromaConfig['configs']) => {
        const response = await this.request('/api/v1/pleroma/admin/config', { method: 'POST', body: { configs: params } });

        return v.parse(pleromaConfigSchema, response.json);
      },
    },
  };

  public readonly oembed = {
    /**
     * Get OEmbed info as JSON
     * @see {@link https://docs.joinmastodon.org/methods/oembed/#get}
     */
    getOembed: async (url: string, maxwidth?: number, maxheight?: number) => {
      const response = await this.request('/api/oembed', { params: { url, maxwidth, maxheight } });

      return v.parse(v.object({
        type: v.fallback(v.string(), 'rich'),
        version: v.fallback(v.string(), ''),
        author_name: v.fallback(v.string(), ''),
        author_url: v.fallback(v.string(), ''),
        provider_name: v.fallback(v.string(), ''),
        provider_url: v.fallback(v.string(), ''),
        cache_age: v.number(),
        html: v.string(),
        width: v.fallback(v.nullable(v.number()), null),
        height: v.fallback(v.nullable(v.number()), null),
      }), response.json);
    },
  };

  /** @see {@link https://docs.pleroma.social/backend/development/API/chats} */
  public readonly chats = {
    /**
     * create or get an existing Chat for a certain recipient
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/#creating-or-getting-a-chat}
     */
    createChat: async (accountId: string) => {
      const response = await this.request(`/api/v1/pleroma/chats/by-account-id/${accountId}`, { method: 'POST' });

      return v.parse(chatSchema, response.json);
    },

    /**
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/#creating-or-getting-a-chat}
     */
    getChat: async (chatId: string) => {
      const response = await this.request(`/api/v1/pleroma/chats/${chatId}`);

      return v.parse(chatSchema, response.json);
    },

    /**
     * Marking a chat as read
     * mark a number of messages in a chat up to a certain message as read
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/#marking-a-chat-as-read}
     */
    markChatAsRead: async (chatId: string, last_read_id: string) => {
      const response = await this.request(`/api/v1/pleroma/chats/${chatId}/read`, { method: 'POST', body: { last_read_id } });

      return v.parse(chatSchema, response.json);
    },

    /**
     * Marking a single chat message as read
     * To set the `unread` property of a message to `false`
     * https://docs.pleroma.social/backend/development/API/chats/#marking-a-single-chat-message-as-read
     */
    markChatMessageAsRead: async (chatId: string, chatMessageId: string) => {
      const response = await this.request(`/api/v1/pleroma/chats/${chatId}/messages/${chatMessageId}/read`, { method: 'POST' });

      return v.parse(chatSchema, response.json);
    },

    /**
     * Getting a list of Chats
     * This will return a list of chats that you have been involved in, sorted by their last update (so new chats will be at the top).
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/#getting-a-list-of-chats}
     */
    getChats: async (params?: GetChatsParams) =>
      this.#paginatedGet('/api/v2/pleroma/chats', { params }, chatSchema),

    /**
     * Getting the messages for a Chat
     * For a given Chat id, you can get the associated messages with
     */
    getChatMessages: async (chatId: string, params?: GetChatMessagesParams) =>
      this.#paginatedGet(`/api/v1/pleroma/chats/${chatId}/messages`, { params }, chatMessageSchema),

    /**
     * Posting a chat message
     * Posting a chat message for given Chat id works like this:
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/#posting-a-chat-message}
     */
    createChatMessage: async (chatId: string, params: CreateChatMessageParams) => {
      const response = await this.request(`/api/v1/pleroma/chats/${chatId}/messages`, { method: 'POST', body: params });

      return v.parse(chatMessageSchema, response.json);
    },

    /**
     * Deleting a chat message
     * Deleting a chat message for given Chat id works like this:
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/#deleting-a-chat-message}
     */
    deleteChatMessage: async (chatId: string, messageId: string) => {
      const response = await this.request(`/api/v1/pleroma/chats/${chatId}/messages/${messageId}`, { method: 'DELETE' });

      return v.parse(chatMessageSchema, response.json);
    },

    /**
     * Deleting a chat
     *
     * Requires features{@link Features['chatsDelete']}.
     */
    deleteChat: async (chatId: string) => {
      const response = await this.request(`/api/v1/pleroma/chats/${chatId}`, { method: 'DELETE' });

      return v.parse(chatSchema, response.json);
    },
  };

  public readonly events = {
    /**
     * Creates an event
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#apiv1pleromaevents}
     */
    createEvent: async (params: CreateEventParams) => {
      const response = await this.request('/api/v1/pleroma/events', { method: 'POST', body: params });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Edits an event
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#apiv1pleromaeventsid}
     */
    editEvent: async (statusId: string, params: EditEventParams) => {
      const response = await this.request(`/api/v1/pleroma/events/${statusId}`, { method: 'PUT', body: params });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Gets user's joined events
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#apiv1pleromaeventsjoined_events}
     */
    getJoinedEvents: async (state?: 'pending' | 'reject' | 'accept', params?: GetJoinedEventsParams) =>
      this.#paginatedGet('/api/v1/pleroma/events/joined_events', { params: { ...params, state } }, statusSchema),

    /**
     * Gets event participants
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#apiv1pleromaeventsidparticipations}
     */
    getEventParticipations: async (statusId: string, params?: GetEventParticipationsParams) =>
      this.#paginatedGet(`/api/v1/pleroma/events/${statusId}/participations`, { params }, accountSchema),

    /**
     * Gets event participation requests
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#apiv1pleromaeventsidparticipation_requests}
     */
    getEventParticipationRequests: async (statusId: string, params?: GetEventParticipationRequestsParams) =>
      this.#paginatedGet(`/api/v1/pleroma/events/${statusId}/participation_requests`, { params }, v.object({
        account: accountSchema,
        participation_message: v.fallback(v.string(), ''),
      })),

    /**
     * Accepts user to the event
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#apiv1pleromaeventsidparticipation_requestsparticipant_idauthorize}
     */
    acceptEventParticipationRequest: async (statusId: string, accountId: string) => {
      const response = await this.request(`/api/v1/pleroma/events/${statusId}/participation_requests/${accountId}/authorize`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Rejects user from the event
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#rejects-user-from-the-event}
     */
    rejectEventParticipationRequest: async (statusId: string, accountId: string) => {
      const response = await this.request(`/api/v1/pleroma/events/${statusId}/participation_requests/${accountId}/reject`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Joins the event
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#joins-the-event}
     */
    joinEvent: async (statusId: string, participation_message?: string) => {
      const response = await this.request(`/api/v1/pleroma/events/${statusId}/join`, { method: 'POST', body: { participation_message } });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Leaves the event
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#leaves-the-event}
     */
    leaveEvent: async (statusId: string) => {
      const response = await this.request(`/api/v1/pleroma/events/${statusId}/leave`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Event ICS file
     * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#event-ics-file}
     */
    getEventIcs: async (statusId: string) => {
      const response = await this.request(`/api/v1/pleroma/events/${statusId}/ics`, { contentType: '' });

      return response.data;
    },
  };

  public readonly interactionRequests = {
    /**
     * Get an array of interactions requested on your statuses by other accounts, and pending your approval.
     *
     * Requires features{@link Features['interactionRequests']}.
     */
    getInteractionRequests: async (params?: GetInteractionRequestsParams) =>
      this.#paginatedGet('/api/v1/interaction_requests', { params }, interactionRequestSchema),

    /**
     * Get interaction request with the given ID.
     *
     * Requires features{@link Features['interactionRequests']}.
     */
    getInteractionRequest: async (interactionRequestId: string) => {
      const response = await this.request(`/api/v1/interaction_requests/${interactionRequestId}`);

      return v.parse(interactionRequestSchema, response.json);
    },

    /**
     * Accept/authorize/approve an interaction request with the given ID.
     *
     * Requires features{@link Features['interactionRequests']}.
     */
    authorizeInteractionRequest: async (interactionRequestId: string) => {
      const response = await this.request(`/api/v1/interaction_requests/${interactionRequestId}/authorize`, { method: 'POST' });

      return v.parse(interactionRequestSchema, response.json);
    },

    /**
     * Reject an interaction request with the given ID.
     *
     * Requires features{@link Features['interactionRequests']}.
     */
    rejectInteractionRequest: async (interactionRequestId: string) => {
      const response = await this.request(`/api/v1/interaction_requests/${interactionRequestId}/authorize`, { method: 'POST' });

      return v.parse(interactionRequestSchema, response.json);
    },
  };

  /** Routes that are not part of any stable release */
  public readonly experimental = {
    admin: {
    /** @see {@link https://github.com/mastodon/mastodon/pull/19059} */
      groups: {
        /** list groups known to the instance. Mimics the interface of `/api/v1/admin/accounts` */
        getGroups: async (params?: AdminGetGroupsParams) => {
          const response = await this.request('/api/v1/admin/groups', { params });

          return v.parse(filteredArray(groupSchema), response.json);
        },

        /** return basic group information */
        getGroup: async (groupId: string) => {
          const response = await this.request(`/api/v1/admin/groups/${groupId}`);

          return v.parse(groupSchema, response.json);
        },

        /** suspends a group */
        suspendGroup: async (groupId: string) => {
          const response = await this.request(`/api/v1/admin/groups/${groupId}/suspend`, { method: 'POST' });

          return v.parse(groupSchema, response.json);
        },

        /** lift a suspension */
        unsuspendGroup: async (groupId: string) => {
          const response = await this.request(`/api/v1/admin/groups/${groupId}/unsuspend`, { method: 'POST' });

          return v.parse(groupSchema, response.json);
        },

        /** deletes an already-suspended group */
        deleteGroup: async (groupId: string) => {
          const response = await this.request(`/api/v1/admin/groups/${groupId}`, { method: 'DELETE' });

          return v.parse(groupSchema, response.json);
        },
      },
    },

    /** @see {@link https://github.com/mastodon/mastodon/pull/19059} */
    groups: {
      /** returns an array of `Group` entities the current user is a member of */
      getGroups: async () => {
        const response = await this.request('/api/v1/groups');

        return v.parse(filteredArray(groupSchema), response.json);
      },

      /** create a group with the given attributes (`display_name`, `note`, `avatar` and `header`). Sets the user who made the request as group administrator */
      createGroup: async (params: CreateGroupParams) => {
        const response = await this.request('/api/v1/groups', {
          method: 'POST',
          body: params,
          contentType: params.avatar || params.header ? '' : undefined,
        });

        return v.parse(groupSchema, response.json);
      },

      /** returns the `Group` entity describing a given group */
      getGroup: async (groupId: string) => {
        const response = await this.request(`/api/v1/groups/${groupId}`);

        return v.parse(groupSchema, response.json);
      },

      /** update group attributes (`display_name`, `note`, `avatar` and `header`) */
      updateGroup: async (groupId: string, params: UpdateGroupParams) => {
        const response = await this.request(`/api/v1/groups/${groupId}`, {
          method: 'PUT',
          body: params,
          contentType: params.avatar || params.header ? '' : undefined,
        });

        return v.parse(groupSchema, response.json);
      },

      /** irreversibly deletes the group */
      deleteGroup: async (groupId: string) => {
        const response = await this.request(`/api/v1/groups/${groupId}`, { method: 'DELETE' });

        return response.json as {};
      },

      /** Has an optional role attribute that can be used to filter by role (valid roles are `"admin"`, `"moderator"`, `"user"`). */
      getGroupMemberships: async (groupId: string, role?: GroupRole, params?: GetGroupMembershipsParams) =>
        this.#paginatedGet(`/api/v1/groups/${groupId}/memberships`, { params: { ...params, role } }, groupMemberSchema),

      /** returns an array of `Account` entities representing pending requests to join a group */
      getGroupMembershipRequests: async (groupId: string, params?: GetGroupMembershipRequestsParams) =>
        this.#paginatedGet(`/api/v1/groups/${groupId}/membership_requests`, { params }, accountSchema),

      /** accept a pending request to become a group member */
      acceptGroupMembershipRequest: async (groupId: string, accountId: string) => {
        const response = await this.request(`/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`, { method: 'POST' });

        return response.json as {};
      },

      /** reject a pending request to become a group member */
      rejectGroupMembershipRequest: async (groupId: string, accountId: string) => {
        const response = await this.request(`/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`, { method: 'POST' });

        return response.json as {};
      },

      /** delete a group post (actually marks it as `revoked` if it is a local post) */
      deleteGroupStatus: async (groupId: string, statusId: string) => {
        const response = await this.request(`/api/v1/groups/${groupId}/statuses/${statusId}`, { method: 'DELETE' });

        return response.json as {};
      },

      /** list accounts blocked from interacting with the group */
      getGroupBlocks: async (groupId: string, params?: GetGroupBlocksParams) =>
        this.#paginatedGet(`/api/v1/groups/${groupId}/blocks`, { params }, accountSchema),

      /** block one or more users. If they were in the group, they are also kicked of it */
      blockGroupUsers: async (groupId: string, accountIds: string[]) => {
        const response = await this.request(`/api/v1/groups/${groupId}/blocks`, { method: 'POST', params: { account_ids: accountIds } });

        return response.json as {};
      },

      /** block one or more users. If they were in the group, they are also kicked of it */
      unblockGroupUsers: async (groupId: string, accountIds: string[]) => {
        const response = await this.request(`/api/v1/groups/${groupId}/blocks`, { method: 'DELETE', params: { account_ids: accountIds } });

        return response.json as {};
      },

      /** joins (or request to join) a given group */
      joinGroup: async (groupId: string) => {
        const response = await this.request(`/api/v1/groups/${groupId}/join`, { method: 'POST' });

        return v.parse(groupRelationshipSchema, response.json);
      },

      /** leaves a given group */
      leaveGroup: async (groupId: string) => {
        const response = await this.request(`/api/v1/groups/${groupId}/leave`, { method: 'POST' });

        return v.parse(groupRelationshipSchema, response.json);
      },

      /** kick one or more group members */
      kickGroupUsers: async (groupId: string, accountIds: string[]) => {
        const response = await this.request(`/api/v1/groups/${groupId}/kick`, { method: 'POST', params: { account_ids: accountIds } });

        return response.json as {};
      },

      /** promote one or more accounts to role `new_role`. An error is returned if any of those accounts has a higher role than `new_role` already, or if the role is higher than the issuing user's. Valid roles are `admin`, and `moderator` and `user`. */
      promoteGroupUsers: async (groupId: string, accountIds: string[], role: GroupRole) => {
        const response = await this.request(`/api/v1/groups/${groupId}/promote`, { method: 'POST', params: { account_ids: accountIds, role } });

        return v.parse(filteredArray(groupMemberSchema), response.json);
      },

      /** demote one or more accounts to role `new_role`. Returns an error unless every of the target account has a strictly lower role than the user (you cannot demote someone with the same role as you), or if any target account already has a role lower than `new_role`. Valid roles are `admin`, `moderator` and `user`. */
      demoteGroupUsers: async (groupId: string, accountIds: string[], role: GroupRole) => {
        const response = await this.request(`/api/v1/groups/${groupId}/demote`, { method: 'POST', params: { account_ids: accountIds, role } });

        return v.parse(filteredArray(groupMemberSchema), response.json);
      },

      getGroupRelationships: async (groupIds: string[]) => {
        const response = await this.request('/api/v1/groups/relationships', { params: { id: groupIds } });

        return v.parse(filteredArray(groupRelationshipSchema), response.json);
      },
    },
  };

  #setInstance = (instance: Instance) => {
    this.#instance = instance;
    this.features = getFeatures(this.#instance);
  };

  get accessToken(): string | undefined {
    return this.#accessToken;
  }

  set accessToken(accessToken: string | undefined)  {
    if (this.#accessToken === accessToken) return;

    this.#socket?.close();
    this.#accessToken = accessToken;
  }

  get instanceInformation() {
    return this.#instance;
  }

}

export {
  PlApiClient,
  PlApiClient as default,
};
