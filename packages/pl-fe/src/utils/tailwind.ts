import tintify from 'pl-fe/utils/colors';
import { generateAccent, generateNeutral } from 'pl-fe/utils/theme';

import type { TailwindColorPalette } from 'pl-fe/types/colors';

type PlFeColors = Record<string, Record<string, string>>;

/** Check if the value is a valid hex color */
const isHex = (value: any): boolean => /^#([0-9A-F]{3}){1,2}$/i.test(value);

/** Expand hex colors into tints */
const expandPalette = (palette: TailwindColorPalette): TailwindColorPalette =>
  // Generate palette only for present colors
  Object.entries(palette).reduce((result: TailwindColorPalette, colorData) => {
    const [colorName, color] = colorData;

    // Conditionally handle hex color and Tailwind color object
    if (typeof color === 'string' && isHex(color)) {
      result[colorName] = tintify(color);
    } else if (color && typeof color === 'object') {
      result[colorName] = color;
    }

    return result;
  }, {});

// Generate accent color only if brandColor is present
const maybeGenerateAccentColor = (brandColor: string): string | null =>
  isHex(brandColor) ? generateAccent(brandColor) : null;

/** Build a color object from legacy colors */
const fromLegacyColors = ({ brandColor, accentColor }: {
  brandColor: string;
  accentColor: string | null;
}): TailwindColorPalette => {
  const accent = typeof accentColor === 'string' && isHex(accentColor) ? accentColor : maybeGenerateAccentColor(brandColor);

  return expandPalette({
    primary: isHex(brandColor) ? brandColor : null,
    secondary: accent,
    accent,
    gray: (isHex(brandColor) ? generateNeutral(brandColor) : null),
  });
};

/** Convert pl-fe Config into Tailwind colors */
const toTailwind = (config: {
  brandColor: string;
  accentColor: string | null;
  colors: Record<string, Record<string, string>>;
}): Record<string, Record<string, string> | string> => {
  const colors: PlFeColors = config.colors;
  const legacyColors = fromLegacyColors(config);


  return {
    ...colors,
    ...Object.fromEntries(Object.entries(legacyColors).map(([key, value]) => [key, typeof value === 'string' ? colors[key] || value : { ...value, ...colors[key] }])),
  };
};

export {
  expandPalette,
  fromLegacyColors,
  toTailwind,
};
