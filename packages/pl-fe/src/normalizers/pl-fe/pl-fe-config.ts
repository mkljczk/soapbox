import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';
import trimStart from 'lodash/trimStart';

import { normalizeUsername } from 'pl-fe/utils/input';
import { toTailwind } from 'pl-fe/utils/tailwind';
import { generateAccent } from 'pl-fe/utils/theme';

import type {
  PromoPanelItem,
  FooterItem,
  CryptoAddress,
} from 'pl-fe/types/pl-fe';

const DEFAULT_COLORS = ImmutableMap<string, any>({
  success: ImmutableMap({
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
  }),
  danger: ImmutableMap({
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
  }),
  'greentext': '#789922',
});

const PromoPanelItemRecord = ImmutableRecord({
  icon: '',
  text: '',
  url: '',
  textLocales: ImmutableMap<string, string>(),
});

const PromoPanelRecord = ImmutableRecord({
  items: ImmutableList<PromoPanelItem>(),
});

const FooterItemRecord = ImmutableRecord({
  title: '',
  url: '',
});

const CryptoAddressRecord = ImmutableRecord({
  address: '',
  note: '',
  ticker: '',
});

const PlFeConfigRecord = ImmutableRecord({
  appleAppId: null,
  authProvider: '',
  logo: '',
  logoDarkMode: null,
  banner: '',
  brandColor: '', // Empty
  accentColor: '',
  colors: ImmutableMap(),
  copyright: `♥${new Date().getFullYear()}. Copying is an act of love. Please copy and share.`,
  customCss: ImmutableList<string>(),
  defaultSettings: ImmutableMap<string, any>(),
  extensions: ImmutableMap(),
  gdpr: false,
  gdprUrl: '',
  greentext: false,
  promoPanel: PromoPanelRecord(),
  navlinks: ImmutableMap({
    homeFooter: ImmutableList<FooterItem>(),
  }),
  verifiedIcon: '',
  displayFqn: true,
  cryptoAddresses: ImmutableList<CryptoAddress>(),
  cryptoDonatePanel: ImmutableMap({
    limit: 1,
  }),
  aboutPages: ImmutableMap<string, ImmutableMap<string, unknown>>(),
  authenticatedProfile: false,
  linkFooterMessage: '',
  links: ImmutableMap<string, string>(),
  displayCta: false,
  /** Whether to inject suggested profiles into the Home feed. */
  feedInjection: true,
  tileServer: '',
  tileServerAttribution: '',
  redirectRootNoLogin: '',
  /**
   * Whether to use the preview URL for media thumbnails.
   * On some platforms this can be too blurry without additional configuration.
   */
  mediaPreview: false,
  sentryDsn: undefined as string | undefined,
}, 'PlFeConfig');

type PlFeConfigMap = ImmutableMap<string, any>;

const normalizeCryptoAddress = (address: unknown): CryptoAddress =>
  CryptoAddressRecord(ImmutableMap(fromJS(address))).update('ticker', ticker =>
    trimStart(ticker, '$').toLowerCase(),
  );

const normalizeCryptoAddresses = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const addresses = ImmutableList(plFeConfig.get('cryptoAddresses'));
  return plFeConfig.set('cryptoAddresses', addresses.map(normalizeCryptoAddress));
};

const normalizeBrandColor = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const brandColor = plFeConfig.get('brandColor') || plFeConfig.getIn(['colors', 'primary', '500']) || '';
  return plFeConfig.set('brandColor', brandColor);
};

const normalizeAccentColor = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const brandColor = plFeConfig.get('brandColor');

  const accentColor = plFeConfig.get('accentColor')
    || plFeConfig.getIn(['colors', 'accent', '500'])
    || (brandColor ? generateAccent(brandColor) : '');

  return plFeConfig.set('accentColor', accentColor);
};

const normalizeColors = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const colors = DEFAULT_COLORS.mergeDeep(plFeConfig.get('colors'));
  return toTailwind(plFeConfig.set('colors', colors));
};

const maybeAddMissingColors = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const colors = plFeConfig.get('colors');

  const missing = ImmutableMap({
    'gradient-start': colors.getIn(['primary', '500']),
    'gradient-end': colors.getIn(['accent', '500']),
    'accent-blue': colors.getIn(['primary', '600']),
  });

  return plFeConfig.set('colors', missing.mergeDeep(colors));
};

const normalizePromoPanel = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const promoPanel = PromoPanelRecord(plFeConfig.get('promoPanel'));
  const items = promoPanel.items.map(PromoPanelItemRecord);
  return plFeConfig.set('promoPanel', promoPanel.set('items', items));
};

const normalizeFooterLinks = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const path = ['navlinks', 'homeFooter'];
  const items = (plFeConfig.getIn(path, ImmutableList()) as ImmutableList<any>).map(FooterItemRecord);
  return plFeConfig.setIn(path, items);
};

/** Single user mode is now managed by `redirectRootNoLogin`. */
const upgradeSingleUserMode = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const singleUserMode = plFeConfig.get('singleUserMode') as boolean | undefined;
  const singleUserModeProfile = plFeConfig.get('singleUserModeProfile') as string | undefined;
  const redirectRootNoLogin = plFeConfig.get('redirectRootNoLogin') as string | undefined;

  if (!redirectRootNoLogin && singleUserMode && singleUserModeProfile) {
    return plFeConfig
      .set('redirectRootNoLogin', `/@${normalizeUsername(singleUserModeProfile)}`)
      .deleteAll(['singleUserMode', 'singleUserModeProfile']);
  } else {
    return plFeConfig
      .deleteAll(['singleUserMode', 'singleUserModeProfile']);
  }
};

/** Ensure a valid path is used. */
const normalizeRedirectRootNoLogin = (plFeConfig: PlFeConfigMap): PlFeConfigMap => {
  const redirectRootNoLogin = plFeConfig.get('redirectRootNoLogin');

  if (!redirectRootNoLogin) return plFeConfig;

  try {
    // Basically just get the pathname with a leading slash.
    const normalized = new URL(redirectRootNoLogin, 'http://a').pathname;

    if (normalized !== '/') {
      return plFeConfig.set('redirectRootNoLogin', normalized);
    } else {
      // Prevent infinite redirect(?)
      return plFeConfig.delete('redirectRootNoLogin');
    }
  } catch (e) {
    console.error('You have configured an invalid redirect in pl-fe Config.');
    console.error(e);
    return plFeConfig.delete('redirectRootNoLogin');
  }
};

const normalizePlFeConfig = (plFeConfig: Record<string, any>) => PlFeConfigRecord(
  ImmutableMap(fromJS(plFeConfig)).withMutations(plFeConfig => {
    normalizeBrandColor(plFeConfig);
    normalizeAccentColor(plFeConfig);
    normalizeColors(plFeConfig);
    normalizePromoPanel(plFeConfig);
    normalizeFooterLinks(plFeConfig);
    maybeAddMissingColors(plFeConfig);
    normalizeCryptoAddresses(plFeConfig);
    upgradeSingleUserMode(plFeConfig);
    normalizeRedirectRootNoLogin(plFeConfig);
  }),
);

export {
  PromoPanelItemRecord,
  FooterItemRecord,
  CryptoAddressRecord,
  PlFeConfigRecord,
  normalizePlFeConfig,
};
