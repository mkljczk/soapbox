import clsx from 'clsx';
import React from 'react';

const spaces = {
  0: 'gap-y-0',
  [0.5]: 'gap-y-0.5',
  1: 'gap-y-1',
  [1.5]: 'gap-y-1.5',
  2: 'gap-y-2',
  3: 'gap-y-3',
  4: 'gap-y-4',
  5: 'gap-y-5',
  6: 'gap-y-6',
  9: 'gap-y-9',
  10: 'gap-y-10',
};

const justifyContentOptions = {
  between: 'justify-between',
  center: 'justify-center',
  end: 'justify-end',
};

const alignItemsOptions = {
  top: 'items-start',
  bottom: 'items-end',
  center: 'items-center',
  start: 'items-start',
  end: 'items-end',
};

interface IStack extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal alignment of children. */
  alignItems?: keyof typeof alignItemsOptions;
  /** Vertical alignment of children. */
  justifyContent?: keyof typeof justifyContentOptions;
  /** Size of the gap between elements. */
  space?: keyof typeof spaces;
  /** Whether to let the flexbox grow. */
  grow?: boolean;
  /** HTML element to use for container. */
  element?: React.ComponentType | keyof JSX.IntrinsicElements;
}

/** Vertical stack of child elements. */
const Stack = React.forwardRef<HTMLDivElement, IStack>((props, ref: React.LegacyRef<HTMLDivElement> | undefined) => {
  const { space, alignItems, justifyContent, className, grow, element = 'div', ...filteredProps } = props;

  const Elem = element as 'div';

  return (
    <Elem
      {...filteredProps}
      ref={ref}
      className={clsx('flex flex-col', {
        // @ts-ignore
        [spaces[space]]: typeof space !== 'undefined',
        // @ts-ignore
        [alignItemsOptions[alignItems]]: typeof alignItems !== 'undefined',
        // @ts-ignore
        [justifyContentOptions[justifyContent]]: typeof justifyContent !== 'undefined',
        'grow': grow,
      }, className)}
    />
  );
});

export { Stack as default };
