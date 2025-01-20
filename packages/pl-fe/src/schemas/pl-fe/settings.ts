import * as v from 'valibot';

import { locales } from 'pl-fe/messages';

import { coerceObject } from '../utils';

const skinToneSchema = v.picklist([1, 2, 3, 4, 5, 6]);

const settingsSchema = v.object({
  onboarded: v.fallback(v.boolean(), false),
  skinTone: v.fallback(skinToneSchema, 1),
  reduceMotion: v.fallback(v.boolean(), false),
  underlineLinks: v.fallback(v.boolean(), false),
  autoPlayGif: v.fallback(v.boolean(), true),
  displayMedia: v.fallback(v.picklist(['default', 'hide_all', 'show_all']), 'default'),
  displaySpoilers: v.fallback(v.boolean(), false),
  unfollowModal: v.fallback(v.boolean(), true),
  boostModal: v.fallback(v.boolean(), false),
  deleteModal: v.fallback(v.boolean(), true),
  missingDescriptionModal: v.fallback(v.boolean(), true),
  defaultPrivacy: v.fallback(v.picklist(['public', 'unlisted', 'private', 'direct']), 'public'),
  defaultContentType: v.fallback(v.picklist(['text/plain', 'text/markdown', 'text/html']), 'text/plain'),
  themeMode: v.fallback(v.picklist(['system', 'light', 'dark', 'black']), 'system'),
  locale: v.fallback(
    v.pipe(
      v.fallback(v.string(), navigator.language),
      v.picklist(locales),
    ),
    'en',
  ),
  showExplanationBox: v.fallback(v.boolean(), true),
  explanationBox: v.fallback(v.boolean(), true),
  autoloadTimelines: v.fallback(v.boolean(), true),
  autoloadMore: v.fallback(v.boolean(), true),
  preserveSpoilers: v.fallback(v.boolean(), false),
  forceImplicitAddressing: v.fallback(v.boolean(), false),
  autoTranslate: v.fallback(v.boolean(), false),
  knownLanguages: v.fallback(v.array(v.string()), []),
  showWrenchButton: v.fallback(v.boolean(), false),

  theme: v.fallback(v.optional(v.object({
    brandColor: v.fallback(v.string(), ''),
    accentColor: v.fallback(v.string(), ''),
    colors: v.any(),
  })), undefined),

  systemFont: v.fallback(v.boolean(), false),
  demetricator: v.fallback(v.boolean(), false),

  isDeveloper: v.fallback(v.boolean(), false),

  chats: coerceObject({
    mainWindow: v.fallback(v.picklist(['minimized', 'open']), 'minimized'),
    sound: v.fallback(v.boolean(), true),
  }),

  timelines: v.fallback(v.record(v.string(), coerceObject({
    shows: coerceObject({
      reblog: v.fallback(v.boolean(), true),
      reply: v.fallback(v.boolean(), true),
      direct: v.fallback(v.boolean(), false),
    }),
    other: coerceObject({
      onlyMedia: v.fallback(v.boolean(), false),
    }),
  })), {}),

  account_timeline: coerceObject({
    shows: coerceObject({
      pinned: v.fallback(v.boolean(), true),
    }),
  }),

  remote_timeline: coerceObject({
    pinnedHosts: v.fallback(v.array(v.string()), []),
  }),

  notifications: coerceObject({
    quickFilter: coerceObject({
      active: v.fallback(v.string(), 'all'),
      advanced: v.fallback(v.boolean(), false),
      show: v.fallback(v.boolean(), true),
    }),
    sounds: v.fallback(v.record(v.string(), v.boolean()), {}),
  }),

  frequentlyUsedEmojis: v.fallback(v.record(v.string(), v.number()), {}),
  frequentlyUsedLanguages: v.fallback(v.record(v.string(), v.number()), {}),

  saved: v.fallback(v.boolean(), true),

  demo: v.fallback(v.boolean(), false),
});

type Settings = v.InferOutput<typeof settingsSchema>;

export { settingsSchema, type Settings };
