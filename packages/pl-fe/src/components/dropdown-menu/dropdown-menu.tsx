import { offset, Placement, useFloating, flip, arrow, shift, autoUpdate } from '@floating-ui/react';
import clsx from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactSwipeableViews from 'react-swipeable-views';

import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Portal from 'pl-fe/components/ui/portal';
import { userTouching } from 'pl-fe/is-mobile';
import { useModalsStore } from 'pl-fe/stores/modals';
import { useUiStore } from 'pl-fe/stores/ui';

import DropdownMenuItem, { MenuItem } from './dropdown-menu-item';

type Menu = Array<MenuItem | null>;

interface IDropdownMenuContent {
  handleClose: () => any;
  items?: Menu;
  component?: React.FC<{ handleClose: () => any }>;
  touchscreen?: boolean;
}

interface IDropdownMenu {
  children?: React.ReactElement;
  disabled?: boolean;
  items?: Menu;
  component?: React.FC<{ handleClose: () => any }>;
  onClose?: () => void;
  onOpen?: () => void;
  onShiftClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>;
  placement?: Placement;
  src?: string;
  title?: string;
}

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

const DropdownMenuContent: React.FC<IDropdownMenuContent> = ({ handleClose, items, component: Component, touchscreen }) => {
  const [tab, setTab] = useState<number>();
  const ref = useRef<HTMLDivElement>(null);

  const autoFocus = items && !items.some((item) => item?.active);

  const handleKeyDown = useMemo(() => (e: KeyboardEvent) => {
    if (!ref.current) return;

    const elements = Array.from(ref.current.querySelectorAll('a, button'));
    const index = elements.indexOf(document.activeElement as any);

    let element = null;

    switch (e.key) {
      case 'ArrowLeft':
        setTab(tab => {
          if (tab !== undefined) {
            (elements[tab] as HTMLElement)?.focus();
            return undefined;
          }
          return tab;
        });
        break;
      case 'ArrowRight':
        // eslint-disable-next-line no-case-declarations
        const itemIndex = +(elements[index]?.getAttribute('data-index') || '');

        if (items?.[itemIndex]?.items) setTab(itemIndex);
        break;
      case 'ArrowDown':
        element = elements[index + 1] || elements[0];
        break;
      case 'ArrowUp':
        element = elements[index - 1] || elements[elements.length - 1];
        break;
      case 'Tab':
        if (e.shiftKey) {
          element = elements[index - 1] || elements[elements.length - 1];
        } else {
          element = elements[index + 1] || elements[0];
        }
        break;
      case 'Home':
        element = elements[0];
        break;
      case 'End':
        element = elements[elements.length - 1];
        break;
      case 'Escape':
        handleClose();
        break;
    }

    if (element) {
      (element as HTMLAnchorElement).focus();
      e.preventDefault();
      e.stopPropagation();
    }
  }, [ref.current]);

  const handleDocumentClick = useMemo(() => (event: Event) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      handleClose();
      event.stopPropagation();
    }
  }, [ref.current]);

  useEffect(() => {
    if (!touchscreen) {
      document.addEventListener('click', handleDocumentClick, false);
      document.addEventListener('touchend', handleDocumentClick, listenerOptions);
    }
    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('touchend', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref.current]);

  const handleExitSubmenu: React.EventHandler<any> = (event) => {
    event.stopPropagation();
    setTab(undefined);
  };

  const renderItems = (items: Menu | undefined) => (
    <ul>
      {items?.map((item, idx) => (
        <DropdownMenuItem
          key={idx}
          item={item}
          index={idx}
          onClick={handleClose}
          autoFocus={autoFocus}
          onSetTab={setTab}
        />
      ))}
    </ul>
  );

  return (
    <div ref={ref}>
      {items?.some(item => item?.items?.length) ? (
        <ReactSwipeableViews animateHeight index={tab === undefined ? 0 : 1}>
          <div className={clsx({ 'w-full': touchscreen })}>
            {Component && <Component handleClose={handleClose} />}
            {(items?.length || touchscreen) && renderItems(items)}
          </div>
          <div className={clsx({ 'w-full': touchscreen, 'fit-content': !touchscreen })}>
            {tab !== undefined && (
              <>
                <HStack className='mx-2 my-1 text-gray-700 dark:text-gray-300' space={3} alignItems='center'>
                  <IconButton
                    theme='transparent'
                    src={require('@tabler/icons/outline/arrow-left.svg')}
                    iconClassName='h-5 w-5'
                    onClick={handleExitSubmenu}
                    autoFocus
                  />
                  {items![tab]?.text}
                </HStack>
                {renderItems(items![tab]?.items)}
              </>
            )}
          </div>
        </ReactSwipeableViews>
      ) : (
        <>
          {Component && <Component handleClose={handleClose} />}
          {(items?.length || touchscreen) && renderItems(items)}
        </>
      )}
    </div>
  );
};

const DropdownMenu = (props: IDropdownMenu) => {
  const {
    children,
    disabled,
    items,
    component,
    onClose,
    onOpen,
    onShiftClick,
    placement: initialPlacement = 'top',
    src = require('@tabler/icons/outline/dots.svg'),
    title = 'Menu',
  } = props;

  const { openDropdownMenu, closeDropdownMenu } = useUiStore();
  const { openModal, closeModal } = useModalsStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDisplayed, setIsDisplayed] = useState<boolean>(false);

  const arrowRef = useRef<HTMLDivElement>(null);

  const { x, y, strategy, refs, middlewareData, placement } = useFloating<HTMLButtonElement>({
    placement: initialPlacement,
    middleware: [
      offset(12),
      flip(),
      shift({
        padding: 8,
      }),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const handleClick: React.EventHandler<
    React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
  > = (event) => {
    event.stopPropagation();

    if (onShiftClick && event.shiftKey) {
      event.preventDefault();

      onShiftClick(event);
      return;
    }

    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  const handleOpen = () => {
    if (userTouching.matches) {
      const handleClose = () => {
        closeModal('DROPDOWN_MENU');
      };
      openModal('DROPDOWN_MENU', {
        content: <DropdownMenuContent handleClose={handleClose} items={items} component={component} touchscreen />,
      });
    } else {
      openDropdownMenu();
      setIsOpen(true);
    }

    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = (goBack: any = true) => {
    (refs.reference.current as HTMLButtonElement)?.focus();

    closeDropdownMenu();
    setIsOpen(false);

    if (onClose) {
      onClose();
    }
  };

  const handleKeyPress: React.EventHandler<React.KeyboardEvent<HTMLButtonElement>> = (event) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.stopPropagation();
        event.preventDefault();
        handleClick(event);
        break;
    }
  };

  const arrowProps: React.CSSProperties = useMemo(() => {
    if (middlewareData.arrow) {
      const { x, y } = middlewareData.arrow;

      const staticPlacement = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      return {
        left: x !== null ? `${x}px` : '',
        top: y !== null ? `${y}px` : '',
        // Ensure the static side gets unset when
        // flipping to other placements' axes.
        right: '',
        bottom: '',
        [staticPlacement as string]: `${(-(arrowRef.current?.offsetWidth || 0)) / 2}px`,
        transform: 'rotate(45deg)',
      };
    }

    return {};
  }, [middlewareData.arrow, placement]);

  useEffect(() => () => {
    closeDropdownMenu();
  }, []);

  useEffect(() => {
    setTimeout(() => setIsDisplayed(isOpen), isOpen ? 0 : 150);

  }, [isOpen]);

  const clonedChildren = useMemo(() => {
    if ((items?.length === 0 && !component) || !children) {
      return null;
    }

    return React.cloneElement(children, {
      disabled,
      onClick: handleClick,
      onKeyPress: handleKeyPress,
      ref: refs.setReference,
    });
  }, [children]);

  if (items?.length === 0 && !component) {
    return null;
  }

  const getClassName = () => {
    const className = clsx('z-[1001] bg-white py-1 shadow-lg ease-in-out focus:outline-none black:bg-black no-reduce-motion:transition-all dark:bg-gray-900 dark:ring-2 dark:ring-primary-700', {
      'rounded-md min-w-56 max-w-sm duration-100': true,
      'no-reduce-motion:scale-0': !(isDisplayed && isOpen),
      'scale-100': isDisplayed && isOpen,
      'origin-bottom': placement === 'top',
      'origin-left': placement === 'right',
      'origin-top': placement === 'bottom',
      'origin-right': placement === 'left',
      'origin-bottom-left': placement === 'top-start',
      'origin-bottom-right': placement === 'top-end',
      'origin-top-left': placement === 'bottom-start',
      'origin-top-right': placement === 'bottom-end',
    });

    return className;
  };

  return (
    <>
      {children ? clonedChildren : (
        <IconButton
          disabled={disabled}
          className={clsx({
            'text-gray-600 hover:text-gray-700 dark:hover:text-gray-500': true,
            'text-gray-700 dark:text-gray-500': isOpen,
          })}
          title={title}
          src={src}
          onClick={handleClick}
          onKeyPress={handleKeyPress}
          ref={refs.setReference}
        />
      )}

      {isOpen || isDisplayed ? (
        <Portal>
          <div
            data-testid='dropdown-menu'
            ref={refs.setFloating}
            className='z-[1001]'
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
          >
            <div className={getClassName()}>
              <DropdownMenuContent handleClose={handleClose} items={items} component={component} />

              {/* Arrow */}
              <div
                ref={arrowRef}
                style={arrowProps}
                className='pointer-events-none absolute z-[-1] size-3 bg-white black:bg-black dark:bg-gray-900'
              />
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
};

export { type Menu, DropdownMenu as default };
