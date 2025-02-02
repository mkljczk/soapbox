import {
  arrow,
  autoPlacement,
  autoUpdate,
  FloatingArrow,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
  type OffsetOptions,
} from '@floating-ui/react';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';

import Portal from './portal';

interface IPopover {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  /** The content of the popover */
  content: React.ReactNode;
  /** Should we remove padding on the Popover */
  isFlush?: boolean;
  /** Should the popover trigger via click or hover */
  interaction?: 'click' | 'hover';
  /** Add a class to the reference (trigger) element */
  referenceElementClassName?: string;
  offsetOptions?: OffsetOptions;
}

/**
 * Popover
 *
 * Similar to tooltip, but requires a click and is used for larger blocks
 * of information.
 */
const Popover: React.FC<IPopover> = ({ children, content, referenceElementClassName, interaction = 'hover', isFlush = false, offsetOptions = 10 }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const arrowRef = useRef<SVGSVGElement>(null);

  const { x, y, strategy, refs, context, placement } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [
      autoPlacement({
        allowedPlacements: ['top', 'bottom'],
      }),
      offset(offsetOptions),
      shift({
        padding: 8,
      }),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
      transformOrigin: placement === 'bottom' ? 'top' : 'bottom',
    },
    duration: {
      open: 100,
      close: 100,
    },
  });

  const click = useClick(context, { enabled: interaction === 'click' });
  const hover = useHover(context, { enabled: interaction === 'hover' });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    hover,
    dismiss,
  ]);

  return (
    <>
      {React.cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
        className: clsx(children.props.className, referenceElementClassName),
        'aria-expanded': isOpen,
      })}

      {isMounted && (
        <Portal>
          <div
            ref={refs.setFloating}
            className='z-40'
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              ...styles,
            }}
          >
            <div
              className={
                clsx(
                  'overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900 dark:ring-2 dark:ring-primary-700',
                  { 'p-6': !isFlush },
                )
              }
              {...getFloatingProps()}
            >
              {content}

            </div>
            <FloatingArrow
              ref={arrowRef}
              context={context}
              className='fill-white dark:fill-primary-700'
              tipRadius={3}
            />
          </div>
        </Portal>
      )}
    </>
  );
};

export { Popover as default };
