import pick from 'lodash.pick';
import * as v from 'valibot';

import { customEmojiSchema } from './custom-emoji';
import { relationshipSchema } from './relationship';
import { roleSchema } from './role';
import { coerceObject, datetimeSchema, filteredArray } from './utils';

const getDomainFromURL = (account: Pick<Account, 'url'>): string => {
  try {
    const url = account.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

const guessFqn = (account: Pick<Account, 'acct' | 'url'>): string => {
  const acct = account.acct;
  const [user, domain] = acct.split('@');

  if (domain) {
    return acct;
  } else {
    return [user, getDomainFromURL(account)].join('@');
  }
};

const filterBadges = (tags?: string[]) =>
  tags?.filter(tag => tag.startsWith('badge:')).map(tag => v.parse(roleSchema, { id: tag, name: tag.replace(/^badge:/, '') }));

const preprocessAccount = v.transform((account: any) => {
  if (!account?.acct) return null;

  const username = account.username || account.acct.split('@')[0];

  const fqn = account.fqn || guessFqn(account);
  const domain = fqn.split('@')[1] || '';

  return {
    username,
    fqn,
    domain,
    avatar_static: account.avatar_static || account.avatar,
    header_static: account.header_static || account.header,
    local: typeof account.pleroma?.is_local === 'boolean' ? account.pleroma.is_local : account.acct.split('@')[1] === undefined,
    discoverable: account.discoverable || account.pleroma?.source?.discoverable,
    verified: account.verified || account.pleroma?.tags?.includes('verified'),
    ...(account.role?.permissions ? {
      is_admin: account.role?.permissions & 0x1,
    } : {}),
    ...(pick(account.pleroma || {}, [
      'ap_id',
      'background_image',
      'relationship',
      'is_moderator',
      'is_admin',
      'hide_favorites',
      'hide_followers',
      'hide_follows',
      'hide_followers_count',
      'hide_follows_count',
      'accepts_chat_messages',
      'favicon',
      'birthday',
      'deactivated',
      'avatar_description',
      'header_description',

      'settings_store',
      'chat_token',
      'allow_following_move',
      'unread_conversation_count',
      'unread_notifications_count',
      'notification_settings',

      'location',
    ])),
    ...(pick(account.other_settings || {}), ['birthday', 'location']),
    __meta: pick(account, ['pleroma', 'source']),
    ...account,
    display_name: account.display_name?.trim() || username,
    roles: account.roles?.length ? account.roles : filterBadges(account.pleroma?.tags),
    source: account.source
      ? { ...(pick(account.pleroma?.source || {}, [
        'show_role', 'no_rich_text', 'discoverable', 'actor_type', 'show_birthday',
      ])), ...account.source }
      : undefined,
  };
});

const fieldSchema = v.object({
  name: v.string(),
  value: v.string(),
  verified_at: v.fallback(v.nullable(datetimeSchema), null),
});

const baseAccountSchema = v.object({
  id: v.string(),
  username: v.fallback(v.string(), ''),
  acct: v.fallback(v.string(), ''),
  url: v.pipe(v.string(), v.url()),
  display_name: v.fallback(v.string(), ''),
  note: v.fallback(v.pipe(v.string(), v.transform(note => note === '<p></p>' ? '' : note)), ''),
  avatar: v.fallback(v.string(), ''),
  avatar_static: v.fallback(v.pipe(v.string(), v.url()), ''),
  header: v.fallback(v.pipe(v.string(), v.url()), ''),
  header_static: v.fallback(v.pipe(v.string(), v.url()), ''),
  locked: v.fallback(v.boolean(), false),
  fields: filteredArray(fieldSchema),
  emojis: filteredArray(customEmojiSchema),
  bot: v.fallback(v.boolean(), false),
  group: v.fallback(v.boolean(), false),
  discoverable: v.fallback(v.boolean(), false),
  noindex: v.fallback(v.nullable(v.boolean()), null),
  suspended: v.fallback(v.optional(v.boolean()), undefined),
  limited: v.fallback(v.optional(v.boolean()), undefined),
  created_at: v.fallback(datetimeSchema, new Date().toISOString()),
  last_status_at: v.fallback(v.nullable(v.pipe(v.string(), v.isoDate())), null),
  statuses_count: v.fallback(v.number(), 0),
  followers_count: v.fallback(v.number(), 0),
  following_count: v.fallback(v.number(), 0),
  roles: filteredArray(roleSchema),

  fqn: v.string(),
  ap_id: v.fallback(v.nullable(v.string()), null),
  background_image: v.fallback(v.nullable(v.string()), null),
  relationship: v.fallback(v.optional(relationshipSchema), undefined),
  is_moderator: v.fallback(v.optional(v.boolean()), undefined),
  is_admin: v.fallback(v.optional(v.boolean()), undefined),
  is_suggested: v.fallback(v.optional(v.boolean()), undefined),
  hide_favorites: v.fallback(v.boolean(), true),
  hide_followers: v.fallback(v.optional(v.boolean()), undefined),
  hide_follows: v.fallback(v.optional(v.boolean()), undefined),
  hide_followers_count: v.fallback(v.optional(v.boolean()), undefined),
  hide_follows_count: v.fallback(v.optional(v.boolean()), undefined),
  accepts_chat_messages: v.fallback(v.nullable(v.boolean()), null),
  favicon: v.fallback(v.optional(v.string()), undefined),
  birthday: v.fallback(v.optional(v.pipe(v.string(), v.isoDate())), undefined),
  deactivated: v.fallback(v.optional(v.boolean()), undefined),

  location: v.fallback(v.optional(v.string()), undefined),
  local: v.fallback(v.optional(v.boolean()), false),

  avatar_description: v.fallback(v.string(), ''),
  enable_rss: v.fallback(v.boolean(), false),
  header_description: v.fallback(v.string(), ''),

  verified: v.fallback(v.optional(v.boolean()), undefined),
  domain: v.fallback(v.string(), ''),

  pronouns: v.fallback(v.array(v.string()), []),

  __meta: coerceObject({
    pleroma: v.fallback(v.any(), undefined),
    source: v.fallback(v.any(), undefined),
  }),
});

const accountWithMovedAccountSchema = v.object({
  ...baseAccountSchema.entries,
  moved: v.fallback(v.nullable(v.lazy((): typeof baseAccountSchema => accountWithMovedAccountSchema as any)), null),
});

/** @see {@link https://docs.joinmastodon.org/entities/Account/} */
const untypedAccountSchema = v.pipe(v.any(), preprocessAccount, accountWithMovedAccountSchema);

type WithMoved = {
  moved: Account | null;
};

/**
 * @category Entity types
 */
type Account = v.InferOutput<typeof accountWithMovedAccountSchema> & WithMoved;

/**
 * @category Schemas
 */
const accountSchema: v.BaseSchema<any, Account, v.BaseIssue<unknown>> = untypedAccountSchema as any;

const untypedCredentialAccountSchema = v.pipe(v.any(), preprocessAccount, v.object({
  ...accountWithMovedAccountSchema.entries,
  source: v.fallback(v.nullable(v.object({
    note: v.fallback(v.string(), ''),
    fields: filteredArray(fieldSchema),
    privacy: v.picklist(['public', 'unlisted', 'private', 'direct']),
    sensitive: v.fallback(v.boolean(), false),
    language: v.fallback(v.nullable(v.string()), null),
    follow_requests_count: v.fallback(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),

    show_role: v.fallback(v.nullable(v.optional(v.boolean())), undefined),
    no_rich_text: v.fallback(v.nullable(v.optional(v.boolean())), undefined),
    discoverable: v.fallback(v.optional(v.boolean()), undefined),
    actor_type: v.fallback(v.optional(v.string()), undefined),
    show_birthday: v.fallback(v.optional(v.boolean()), undefined),
  })), null),
  role: v.fallback(v.nullable(roleSchema), null),

  settings_store: v.fallback(v.optional(v.record(v.string(), v.any())), undefined),
  chat_token: v.fallback(v.optional(v.string()), undefined),
  allow_following_move: v.fallback(v.optional(v.boolean()), undefined),
  unread_conversation_count: v.fallback(v.optional(v.number()), undefined),
  unread_notifications_count: v.fallback(v.optional(v.number()), undefined),
  notification_settings: v.fallback(v.optional(v.object({
    block_from_strangers: v.fallback(v.boolean(), false),
    hide_notification_contents: v.fallback(v.boolean(), false),
  })), undefined),
}));

/**
 * @category Entity types
 */
type CredentialAccount = v.InferOutput<typeof untypedCredentialAccountSchema> & WithMoved;

/**
 * @category Schemas
 */
const credentialAccountSchema: v.BaseSchema<any, CredentialAccount, v.BaseIssue<unknown>> = untypedCredentialAccountSchema as any;

const untypedMutedAccountSchema = v.pipe(v.any(), preprocessAccount, v.object({
  ...accountWithMovedAccountSchema.entries,
  mute_expires_at: v.fallback(v.nullable(datetimeSchema), null),
}));

/**
 * @category Entity types
 */
type MutedAccount = v.InferOutput<typeof untypedMutedAccountSchema> & WithMoved;

/**
 * @category Schemas
 */
const mutedAccountSchema: v.BaseSchema<any, MutedAccount, v.BaseIssue<unknown>> = untypedMutedAccountSchema as any;

export {
  accountSchema,
  credentialAccountSchema,
  mutedAccountSchema,
  type Account,
  type CredentialAccount,
  type MutedAccount,
};
