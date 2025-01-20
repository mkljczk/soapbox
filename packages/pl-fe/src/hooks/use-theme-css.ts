import { useMemo } from 'react';

import { toTailwind } from 'pl-fe/utils/tailwind';
import { generateAccent, generateThemeCss } from 'pl-fe/utils/theme';

import { usePlFeConfig } from './use-pl-fe-config';
import { useSettings } from './use-settings';

import type { PlFeConfig } from 'pl-fe/normalizers/pl-fe/pl-fe-config';

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

const normalizeColors = (theme: Partial<Pick<PlFeConfig, 'brandColor' | 'accentColor' | 'colors'>>) => {
  const brandColor: string = theme.brandColor || theme.colors?.primary?.['500'] || '#d80482';
  const accentColor: string = theme.accentColor || theme.colors?.accent?.['500'] || generateAccent(brandColor) || '';

  const colors = {
    ...theme.colors,
    ...Object.fromEntries(Object.entries(DEFAULT_COLORS).map(([key, value]) => [key, typeof value === 'string' ? value : { ...value, ...theme.colors?.[key] }])),
  };

  const normalizedColors = toTailwind({
    brandColor,
    accentColor,
    // @ts-ignore
    colors,
  });

  return {
    // @ts-ignore
    'gradient-start': normalizedColors.primary?.['500'],
    // @ts-ignore
    'gradient-end': normalizedColors.accent?.['500'],
    // @ts-ignore
    'accent-blue': normalizedColors.primary?.['600'],
    ...normalizedColors,
  } as typeof normalizedColors;
};

const useThemeCss = (overwriteConfig?: PlFeConfig) => {
  const { demo, theme } = useSettings();
  const plFeConfig = usePlFeConfig();

  return useMemo(() => {
    try {
      let baseTheme: Partial<PlFeConfig>;
      if (overwriteConfig) baseTheme = overwriteConfig;
      else if (demo) baseTheme = {};
      else baseTheme = theme || plFeConfig;

      const colors = normalizeColors(baseTheme);

      return generateThemeCss(colors);
    } catch (_) {
      return generateThemeCss({});
    }
  }, [demo, plFeConfig, theme]);
};

export { normalizeColors, useThemeCss };
