// Converts cryptocurrency-icon's manifest file from a list to a map.
// See: https://github.com/spothq/cryptocurrency-icons/blob/master/manifest.json

import manifest from 'cryptocurrency-icons/manifest.json';

const manifestMap = manifest.reduce((acc: Record<string, typeof manifest[0]>, entry) => {
  acc[entry.symbol.toLowerCase()] = entry;
  return acc;
}, {});

export { manifestMap as default };
