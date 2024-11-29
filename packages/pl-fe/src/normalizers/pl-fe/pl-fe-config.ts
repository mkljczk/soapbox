import trimStart from 'lodash/trimStart';
import * as v from 'valibot';

import { coerceObject, filteredArray } from 'pl-fe/schemas/utils';
import { toTailwind } from 'pl-fe/utils/tailwind';
import { generateAccent } from 'pl-fe/utils/theme';

const DEFAULT_COLORS = {
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  'greentext': '#789922',
};

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

const plFeConfigSchema = v.pipe(coerceObject({
  appleAppId: v.fallback(v.nullable(v.string()), null),
  logo: v.fallback(v.string(), ''),
  logoDarkMode: v.fallback(v.nullable(v.string()), null),
  brandColor: v.fallback(v.string(), ''),
  accentColor: v.fallback(v.string(), ''),
  colors: v.any(),
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
}), v.transform((config) => {
  const brandColor: string = config.brandColor || config.colors?.primary?.['500'] || '';
  const accentColor: string = config.accentColor || config.colors?.accent?.['500'] || '' || generateAccent(brandColor);

  const colors = {
    ...config.colors,
    ...Object.fromEntries(Object.entries(DEFAULT_COLORS).map(([key, value]) => [key, typeof value === 'string' ? value : { ...value, ...config.colors?.[key] }])),
  };

  const normalizedColors = toTailwind({
    brandColor,
    accentColor,
    colors,
  });

  return {
    ...config,
    brandColor,
    accentColor,
    colors: {
      // @ts-ignore
      'gradient-start': normalizedColors.primary?.['500'],
      // @ts-ignore
      'gradient-end': normalizedColors.accent?.['500'],
      // @ts-ignore
      'accent-blue': normalizedColors.primary?.['600'],
      ...normalizedColors,
    } as typeof normalizedColors,
  };
}));

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
