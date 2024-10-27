/* eslint sort-keys: "error" */
import * as v from 'valibot';

import { accountSchema } from './account';
import { ruleSchema } from './rule';
import { coerceObject, filteredArray, mimeSchema } from './utils';

const getApiVersions = (instance: any) => ({
  ...Object.fromEntries(instance.pleroma?.metadata?.features?.map((feature: string) => {
    let string = `${feature}.pleroma.pl-api`;
    if (string.startsWith('pleroma:') || string.startsWith('pleroma_')) string = string.slice(8);
    if (string.startsWith('akkoma:')) string = string.slice(7);
    if (string.startsWith('pl:')) string = string.slice(3);
    return [string, 1];
  }) || []),
  ...Object.fromEntries(instance.fedibird_capabilities?.map((feature: string) => [`${feature}.fedibird.pl-api`, 1]) || []),
  ...instance.api_versions,
});

const instanceV1ToV2 = (data: any) => {
  const {
    approval_required,
    configuration,
    contact_account,
    description,
    description_limit,
    email,
    max_media_attachments,
    max_toot_chars,
    poll_limits,
    pleroma,
    registrations,
    short_description,
    thumbnail,
    upload_limit,
    uri,
    urls,
    ...instance
  } = v.parse(instanceV1Schema, data);

  return {
    ...instance,
    account_domain: instance.account_domain	|| uri,
    configuration: {
      ...configuration,
      media_attachments: {
        ...configuration.media_attachments,
        image_size_limit: upload_limit ?? configuration.media_attachments.image_size_limit,
        video_size_limit: upload_limit ?? configuration.media_attachments.video_size_limit,
      },
      polls: {
        ...configuration.polls,
        max_characters_per_option: poll_limits.max_option_chars ?? configuration.polls.max_characters_per_option,
        max_expiration: poll_limits.max_expiration ?? configuration.polls.max_expiration,
        max_options: poll_limits.max_options ?? configuration.polls.max_options,
        min_expiration: poll_limits.min_expiration ?? configuration.polls.min_expiration,
      },
      statuses: {
        ...configuration.statuses,
        max_characters: max_toot_chars ?? configuration.statuses.max_characters,
        max_media_attachments: max_media_attachments ?? configuration.statuses.max_media_attachments,
      },
      urls: {
        streaming: urls.streaming_api,
      },
      vapid: {
        public_key: pleroma.vapid_public_key,
      },
    },
    contact: {
      account: contact_account,
      email: email,
    },
    description: short_description || description,
    domain: uri,
    pleroma: {
      ...pleroma,
      metadata: {
        ...pleroma.metadata,
        description_limit,
      },
    },
    registrations: {
      approval_required: approval_required,
      enabled: registrations,
    },
    thumbnail: { url: thumbnail },
  };
};

const fixVersion = (version: string) => {
  // Handle Mastodon release candidates
  if (new RegExp(/[0-9.]+rc[0-9]+/g).test(version)) {
    version = version.split('rc').join('-rc');
  }

  // Rename Akkoma to Pleroma+akkoma
  if (version.includes('Akkoma')) {
    version = '2.7.2 (compatible; Pleroma 2.4.50+akkoma)';
  }

  // Set Takahē version to a Pleroma-like string
  if (version.startsWith('takahe/')) {
    version = `0.0.0 (compatible; Takahe ${version.slice(7)})`;
  }

  return version;
};

const configurationSchema = coerceObject({
  accounts: v.fallback(v.nullable(v.object({
    allow_custom_css: v.boolean(),
    max_featured_tags: v.pipe(v.number(), v.integer()),
    max_profile_fields: v.pipe(v.number(), v.integer()),
  })), null),
  chats: coerceObject({
    max_characters: v.fallback(v.number(), 5000),
  }),
  groups: coerceObject({
    max_characters_description: v.fallback(v.number(), 160),
    max_characters_name: v.fallback(v.number(), 50),
  }),
  media_attachments: coerceObject({
    image_matrix_limit: v.fallback(v.optional(v.number()), undefined),
    image_size_limit: v.fallback(v.optional(v.number()), undefined),
    supported_mime_types: v.fallback(v.optional(v.array(mimeSchema)), undefined),
    video_duration_limit: v.fallback(v.optional(v.number()), undefined),
    video_frame_rate_limit: v.fallback(v.optional(v.number()), undefined),
    video_matrix_limit: v.fallback(v.optional(v.number()), undefined),
    video_size_limit: v.fallback(v.optional(v.number()), undefined),
  }),
  polls: coerceObject({
    max_characters_per_option: v.fallback(v.number(), 25),
    max_expiration: v.fallback(v.number(), 2629746),
    max_options: v.fallback(v.number(), 4),
    min_expiration: v.fallback(v.number(), 300),
  }),
  reactions: coerceObject({
    max_reactions: v.fallback(v.number(), 0),
  }),
  statuses: coerceObject({
    characters_reserved_per_url: v.fallback(v.optional(v.number()), undefined),
    max_characters: v.fallback(v.number(), 500),
    max_media_attachments: v.fallback(v.number(), 4),

  }),
  translation: coerceObject({
    enabled: v.fallback(v.boolean(), false),
  }),
  urls: coerceObject({
    streaming: v.fallback(v.optional(v.pipe(v.string(), v.url())), undefined),
  }),
  vapid: coerceObject({
    public_key: v.fallback(v.string(), ''),
  }),
});

const contactSchema = coerceObject({
  contact_account: v.fallback(v.optional(accountSchema), undefined),
  email: v.fallback(v.pipe(v.string(), v.email()), ''),
});

const pleromaSchema = coerceObject({
  metadata: coerceObject({
    account_activation_required: v.fallback(v.boolean(), false),
    birthday_min_age: v.fallback(v.number(), 0),
    birthday_required: v.fallback(v.boolean(), false),
    description_limit: v.fallback(v.number(), 1500),
    federation: coerceObject({
      enabled: v.fallback(v.boolean(), true), // Assume true unless explicitly false
      mrf_policies: v.fallback(v.optional(v.array(v.string())), undefined),
      mrf_simple: coerceObject({
        accept: v.fallback(v.array(v.string()), []),
        avatar_removal: v.fallback(v.array(v.string()), []),
        banner_removal: v.fallback(v.array(v.string()), []),
        federated_timeline_removal: v.fallback(v.array(v.string()), []),
        followers_only: v.fallback(v.array(v.string()), []),
        media_nsfw: v.fallback(v.array(v.string()), []),
        media_removal: v.fallback(v.array(v.string()), []),
        reject: v.fallback(v.array(v.string()), []),
        reject_deletes: v.fallback(v.array(v.string()), []),
        report_removal: v.fallback(v.array(v.string()), []),
      }),
    }),
    fields_limits: coerceObject({
      max_fields: v.fallback(v.pipe(v.number(), v.integer(), v.minValue(0)), 4),
      name_length: v.fallback(v.pipe(v.number(), v.integer(), v.minValue(0)), 255),
      value_length: v.fallback(v.pipe(v.number(), v.integer(), v.minValue(0)), 2047),
    }),
    markup: coerceObject({
      allow_headings: v.fallback(v.boolean(), false),
      allow_inline_images: v.fallback(v.boolean(), false),
    }),
    migration_cooldown_period: v.fallback(v.optional(v.number()), undefined),
    multitenancy: coerceObject({
      domains: v.optional(v.array(
        v.object({
          domain: v.pipe(v.unknown(), v.transform(String)),
          id: v.string(),
          public: v.fallback(v.boolean(), false),
        }),
      )),
      enabled: v.fallback(v.boolean(), false),
    }),
    post_formats: v.fallback(v.array(v.string()), ['text/plain']),
    restrict_unauthenticated: coerceObject({
      activities: coerceObject({
        local: v.fallback(v.boolean(), false),
        remote: v.fallback(v.boolean(), false),
      }),
      profiles: coerceObject({
        local: v.fallback(v.boolean(), false),
        remote: v.fallback(v.boolean(), false),
      }),
      timelines: coerceObject({
        bubble: v.fallback(v.boolean(), false),
        federated: v.fallback(v.boolean(), false),
        local: v.fallback(v.boolean(), false),
      }),
    }),
    translation: coerceObject({
      allow_remote: v.fallback(v.boolean(), true),
      allow_unauthenticated: v.fallback(v.boolean(), false),
      source_languages: v.fallback(v.optional(v.array(v.string())), undefined),
      target_languages: v.fallback(v.optional(v.array(v.string())), undefined),
    }),
  }),
  oauth_consumer_strategies: v.fallback(v.array(v.string()), []),
  stats: coerceObject({
    mau: v.fallback(v.optional(v.number()), undefined),
  }),
  vapid_public_key: v.fallback(v.string(), ''),
});

const pleromaPollLimitsSchema = coerceObject({
  max_expiration: v.fallback(v.optional(v.number()), undefined),
  max_option_chars: v.fallback(v.optional(v.number()), undefined),
  max_options: v.fallback(v.optional(v.number()), undefined),
  min_expiration: v.fallback(v.optional(v.number()), undefined),
});

const registrations = coerceObject({
  approval_required: v.fallback(v.boolean(), false),
  enabled: v.fallback(v.boolean(), false),
  message: v.fallback(v.optional(v.string()), undefined),
});

const statsSchema = coerceObject({
  domain_count: v.fallback(v.optional(v.number()), undefined),
  status_count: v.fallback(v.optional(v.number()), undefined),
  user_count: v.fallback(v.optional(v.number()), undefined),
});

const thumbnailSchema = coerceObject({
  url: v.fallback(v.string(), ''),
});

const usageSchema = coerceObject({
  users: coerceObject({
    active_month: v.fallback(v.number(), 0),
  }),
});

const instanceV1Schema = coerceObject({
  account_domain: v.fallback(v.string(), ''),
  approval_required: v.fallback(v.boolean(), false),
  configuration: configurationSchema,
  contact_account: v.fallback(v.optional(accountSchema), undefined),
  description: v.fallback(v.string(), ''),
  description_limit: v.fallback(v.number(), 1500),
  email: v.fallback(v.pipe(v.string(), v.email()), ''),
  feature_quote: v.fallback(v.boolean(), false),
  fedibird_capabilities: v.fallback(v.array(v.string()), []),
  languages: v.fallback(v.array(v.string()), []),
  max_media_attachments: v.fallback(v.optional(v.number()), undefined),
  max_toot_chars: v.fallback(v.optional(v.number()), undefined),
  pleroma: pleromaSchema,
  poll_limits: pleromaPollLimitsSchema,
  registrations: v.fallback(v.boolean(), false),
  rules: filteredArray(ruleSchema),
  short_description: v.fallback(v.string(), ''),
  stats: statsSchema,
  thumbnail: v.fallback(v.string(), ''),
  title: v.fallback(v.string(), ''),
  upload_limit: v.fallback(v.optional(v.number()), undefined),
  uri: v.fallback(v.string(), ''),
  urls: coerceObject({
    streaming_api: v.fallback(v.optional(v.pipe(v.string(), v.url())), undefined),
  }),
  usage: usageSchema,
  version: v.fallback(v.string(), '0.0.0'),
});

/** @see {@link https://docs.joinmastodon.org/entities/Instance/} */
const instanceSchema = v.pipe(
  v.any(),
  v.transform((data: any) => {
  // Detect GoToSocial
    if (typeof data.configuration?.accounts?.allow_custom_css === 'boolean') {
      data.version = `0.0.0 (compatible; GoToSocial ${data.version})`;
    }

    const apiVersions = getApiVersions(data);

    if (data.domain) return { account_domain: data.domain, ...data, api_versions: apiVersions };

    return instanceV1ToV2({ ...data, api_versions: apiVersions });
  }),
  coerceObject({
    account_domain: v.fallback(v.string(), ''),
    api_versions: v.fallback(v.record(v.string(), v.number()), {}),
    configuration: configurationSchema,
    contact: contactSchema,
    description: v.fallback(v.string(), ''),
    domain: v.fallback(v.string(), ''),
    feature_quote: v.fallback(v.boolean(), false),
    languages: v.fallback(v.array(v.string()), []),
    pleroma: pleromaSchema,
    registrations: registrations,
    rules: filteredArray(ruleSchema),
    stats: statsSchema,
    thumbnail: thumbnailSchema,
    title: v.fallback(v.string(), ''),
    usage: usageSchema,
    version: v.pipe(v.fallback(v.string(), '0.0.0'), v.transform(fixVersion)),
  }),
);

type Instance = v.InferOutput<typeof instanceSchema>;

export { instanceSchema, type Instance };
