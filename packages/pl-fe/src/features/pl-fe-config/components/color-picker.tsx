import React from 'react';
import { SketchPicker, type ColorChangeHandler } from 'react-color';

import Popover from 'pl-fe/components/ui/popover';

interface IColorPicker {
  value: string;
  onChange: ColorChangeHandler;
  className?: string;
}

const ColorPicker: React.FC<IColorPicker> = ({ value, onChange, className }) => (
  <div className={className}>
    <Popover
      interaction='click'
      content={
        <SketchPicker color={value} disableAlpha onChange={onChange} />
      }
      isFlush
    >
      <div
        className='size-full'
        role='presentation'
        style={{ background: value }}
        title={value}
      />
    </Popover>
  </div>
);

export { ColorPicker as default };
