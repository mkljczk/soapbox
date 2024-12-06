const minimumAspectRatio = 9 / 16; // Portrait phone
const maximumAspectRatio = 10; // Generous min-height

const isPanoramic = (ar: number | null) => {
  if (ar === null || isNaN(ar)) return false;
  return ar >= maximumAspectRatio;
};

const isPortrait = (ar: number | null) => {
  if (ar === null || isNaN(ar)) return false;
  return ar <= minimumAspectRatio;
};

const isNonConformingRatio = (ar: number | null) => {
  if (ar === null || isNaN(ar)) return false;
  return !isPanoramic(ar) && !isPortrait(ar);
};

export {
  minimumAspectRatio,
  maximumAspectRatio,
  isPanoramic,
  isPortrait,
  isNonConformingRatio,
};
