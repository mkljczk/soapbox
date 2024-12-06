import React from 'react';

import ColorPicker from 'pl-fe/features/pl-fe-config/components/color-picker';

import type { ColorChangeHandler } from 'react-color';

interface IColor {
  color: string;
  onChange?: (color: string) => void;
}

/** Color input. */
const Color: React.FC<IColor> = ({ color, onChange }) => {

  const handleChange: ColorChangeHandler = (result) => {
    onChange?.(result.hex);
  };

  return (
    <ColorPicker
      className='size-full'
      value={color}
      onChange={onChange ? handleChange : undefined}
    />
  );
};

export { Color as default };
