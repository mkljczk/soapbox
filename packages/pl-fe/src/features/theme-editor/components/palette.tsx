import React, { useEffect, useState } from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Slider from 'pl-fe/components/ui/slider';
import Stack from 'pl-fe/components/ui/stack';
import { usePrevious } from 'pl-fe/hooks/use-previous';
import { compareId } from 'pl-fe/utils/comparators';
import { hueShift } from 'pl-fe/utils/theme';

import Color from './color';

interface ColorGroup {
  [tint: string]: string;
}

interface IPalette {
  palette: ColorGroup;
  onChange: (palette: ColorGroup) => void;
  resetKey?: string;
  allowTintChange?: boolean;
}

/** Editable color palette. */
const Palette: React.FC<IPalette> = ({ palette, onChange, resetKey, allowTintChange = true }) => {
  const tints = Object.keys(palette).sort(compareId);

  const [hue, setHue] = useState(0);
  const lastHue = usePrevious(hue);

  const handleChange = (tint: string) => (color: string) => {
    onChange({
      ...palette,
      [tint]: color,
    });
  };

  useEffect(() => {
    const delta = hue - (lastHue || 0);

    const adjusted = Object.entries(palette).reduce<ColorGroup>((result, [tint, hex]) => {
      result[tint] = hueShift(hex, delta * 360);
      return result;
    }, {});

    onChange(adjusted);
  }, [hue]);

  useEffect(() => {
    setHue(0);
  }, [resetKey]);

  return (
    <Stack className='w-full'>
      <HStack className='h-8 overflow-hidden rounded-md'>
        {tints.map(tint => (
          <Color color={palette[tint]} onChange={allowTintChange ? handleChange(tint) : undefined} />
        ))}
      </HStack>

      <Slider value={hue} onChange={setHue} />
    </Stack>
  );
};

export {
  Palette as default,
  ColorGroup,
};
