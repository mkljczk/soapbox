import trimStart from 'lodash/trimStart';
import * as v from 'valibot';

import { coerceObject, filteredArray } from 'pl-fe/schemas/utils';

const promoPanelItemSchema = coerceObject({
  icon: v.fallback(v.string(), ''),
  text: v.fallback(v.string(), ''),
  url: v.fallback(v.string(), ''),
  textLocales: v.fallback(v.record(v.string(), v.string()), {}),
});

type PromoPanelItem = v.InferOutput<typeof promoPanelItemSchema>;

const promoPanelSchema = coerceObject({
  items: filteredArray(promoPanelItemSchema),
});

type PromoPanel = v.InferOutput<typeof promoPanelSchema>;

const footerItemSchema = coerceObject({
  title: v.fallback(v.string(), ''),
  url: v.fallback(v.string(), ''),
  titleLocales: v.fallback(v.record(v.string(), v.string()), {}),
});

type FooterItem = v.InferOutput<typeof footerItemSchema>;

const cryptoAddressSchema = v.pipe(coerceObject({
  address: v.fallback(v.string(), ''),
  note: v.fallback(v.string(), ''),
  ticker: v.fallback(v.string(), ''),
}), v.transform((address) => {
  address.ticker = trimStart(address.ticker, '$').toLowerCase();
  return address;
}));

type CryptoAddress = v.InferOutput<typeof cryptoAddressSchema>;

const plFeConfigSchema = coerceObject({
  appleAppId: v.fallback(v.nullable(v.string()), null),
  logo: v.fallback(v.string(), ''),
  logoDarkMode: v.fallback(v.nullable(v.string()), null),
  brandColor: v.fallback(v.string(), ''),
  accentColor: v.fallback(v.string(), ''),
  colors: v.fallback(v.nullable(v.objectWithRest(
    {
      'accent-blue': v.string(),
      'gradient-end': v.string(),
      'gradient-start': v.string(),
      greentext: v.string(),
    },
    v.record(v.string(), v.string()),
  )), null),
  copyright: v.fallback(v.string(), `♥${new Date().getFullYear()}. Copying is an act of love. Please copy and share.`),
  defaultSettings: v.fallback(v.record(v.string(), v.any()), {}),
  gdpr: v.fallback(v.boolean(), false),
  gdprUrl: v.fallback(v.string(), ''),
  greentext: v.fallback(v.boolean(), false),
  promoPanel: promoPanelSchema,
  navlinks: v.fallback(v.record(v.string(), filteredArray(footerItemSchema)), {}),
  verifiedIcon: v.fallback(v.string(), ''),
  displayFqn: v.fallback(v.boolean(), true),
  cryptoAddresses: filteredArray(cryptoAddressSchema),
  cryptoDonatePanel: coerceObject({
    limit: v.fallback(v.number(), 1),
  }),
  aboutPages: v.fallback(v.record(v.string(), coerceObject({
    defaultLocale: v.fallback(v.string(), ''), // v.fallback(v.optional(v.string()), undefined),
    locales: filteredArray(v.string()),
  })), {}),
  authenticatedProfile: v.fallback(v.boolean(), false),
  linkFooterMessage: v.fallback(v.string(), ''),
  links: v.fallback(v.record(v.string(), v.string()), {}),
  displayCta: v.fallback(v.boolean(), false),
  tileServer: v.fallback(v.string(), ''),
  tileServerAttribution: v.fallback(v.string(), ''),
  redirectRootNoLogin: v.fallback(v.pipe(v.string(), v.transform((url: string) => {
    if (!url) return '';

    try {
      // Basically just get the pathname with a leading slash.
      const normalized = new URL(url, 'http://a').pathname;

      if (normalized !== '/') {
        return normalized;
      } else {
        // Prevent infinite redirect(?)
        return '';
      }
    } catch (e) {
      console.error('You have configured an invalid redirect in pl-fe Config.');
      console.error(e);
      return '';
    }
  })), ''),
  /**
   * Whether to use the preview URL for media thumbnails.
   * On some platforms this can be too blurry without additional configuration.
   */
  mediaPreview: v.fallback(v.boolean(), false),
  sentryDsn: v.fallback(v.optional(v.string()), undefined),
});

type PlFeConfig = v.InferOutput<typeof plFeConfigSchema>;

export {
  promoPanelItemSchema,
  footerItemSchema,
  cryptoAddressSchema,
  plFeConfigSchema,
  type PromoPanelItem,
  type PromoPanel,
  type FooterItem,
  type CryptoAddress,
  type PlFeConfig,
};
