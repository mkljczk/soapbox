import clsx from 'clsx';
import React from 'react';

interface IInlineMultiselect<T extends string> {
  items: Record<T, string>;
  value?: T[];
  onChange: ((values: T[]) => void);
  disabled?: boolean;
}

/** Allows to select many of available options. */
const InlineMultiselect = <T extends string>({ items, value, onChange, disabled }: IInlineMultiselect<T>) => (
  <div className='black:bg-black flex w-fit overflow-auto rounded-md border border-gray-400 bg-white dark:border-gray-800 dark:bg-gray-900'>
    {Object.entries(items).map(([key, label], i) => {
      const checked = value?.includes(key as T);

      return (
        <label
          className={clsx('hover:bg-primary-700 [&:has(:focus-visible)]:bg-primary-700 whitespace-nowrap px-3 py-2 text-white transition-colors', {
            'cursor-pointer': !disabled,
            'opacity-75': disabled,
            'bg-gray-500': !checked,
            'bg-primary-600': checked,
            'border-l border-gray-400 dark:border-gray-800': i !== 0,
          })}
          key={key}
        >
          <input
            name={key}
            type='checkbox'
            className='sr-only'
            checked={checked}
            onChange={({ target }) => onChange((target.checked ? [...(value || []), target.name] : value?.filter(key => key !== target.name) || []) as Array<T>)}
            disabled={disabled}
          />
          {label as string}
        </label>
      );
    })}
  </div>
);

export {
  InlineMultiselect,
};
