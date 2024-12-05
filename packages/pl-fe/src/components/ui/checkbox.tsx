import React from 'react';

interface ICheckbox extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'disabled' | 'id' | 'name' | 'onChange' | 'checked' | 'required'> { }

/** A pretty checkbox input. */
const Checkbox = React.forwardRef<HTMLInputElement, ICheckbox>((props, ref) => (
  <input
    {...props}
    ref={ref}
    type='checkbox'
    className='text-primary-600 focus:ring-primary-500 black:bg-black size-4 rounded border-2 border-gray-300 dark:border-gray-800 dark:bg-gray-900'
  />
));

export { Checkbox as default };
