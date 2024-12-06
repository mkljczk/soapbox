import React from 'react';
import { SketchPicker, type ColorChangeHandler } from 'react-color';

import Popover from 'pl-fe/components/ui/popover';

interface IColorPicker {
  value: string;
  onChange?: ColorChangeHandler;
  className?: string;
}

const ColorPicker: React.FC<IColorPicker> = ({ value, onChange, className }) => {
  const colorPreview = (
    <div
      className='size-full'
      role='presentation'
      style={{ background: value }}
      title={value}
    />
  );
  return (
    <div className={className}>
      {onChange ? (
        <Popover
          interaction='click'
          content={
            <SketchPicker color={value} disableAlpha onChange={onChange} />
          }
          isFlush
        >
          {colorPreview}
        </Popover>
      ) : colorPreview}
    </div>
  );
};
export { ColorPicker as default };
