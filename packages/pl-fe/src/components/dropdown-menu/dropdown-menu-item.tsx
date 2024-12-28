import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import Counter from 'pl-fe/components/ui/counter';
import Icon from 'pl-fe/components/ui/icon';
import Toggle from 'pl-fe/components/ui/toggle';
import { userTouching } from 'pl-fe/is-mobile';

interface MenuItem {
  action?: React.EventHandler<React.KeyboardEvent | React.MouseEvent>;
  active?: boolean;
  checked?: boolean;
  count?: number;
  destructive?: boolean;
  href?: string;
  icon?: string;
  meta?: string;
  middleClick?(event: React.MouseEvent): void;
  onChange?: (value: boolean) => void;
  target?: React.HTMLAttributeAnchorTarget;
  text: string;
  to?: string;
  type?: 'toggle';
  items?: Array<Omit<MenuItem, 'items'>>;
  secondaryIcon?: string;
  secondaryAction?: React.EventHandler<React.KeyboardEvent | React.MouseEvent>;
  secondaryTitle?: string;
}

interface IDropdownMenuItem {
  index: number;
  item: MenuItem | null;
  onClick?(goBack?: boolean): void;
  autoFocus?: boolean;
  onSetTab: (tab?: number) => void;
}

const DropdownMenuItem = ({ index, item, onClick, autoFocus, onSetTab }: IDropdownMenuItem) => {
  const history = useHistory();

  const itemRef = useRef<HTMLAnchorElement>(null);

  const handleClick: React.EventHandler<React.MouseEvent | React.KeyboardEvent> = (event) => {
    event.stopPropagation();

    if (!item) return;

    if (item.items?.length) {
      event.preventDefault();
      onSetTab(index);
      return;
    }

    if (onClick) onClick(!(item.to && userTouching.matches));

    if (item.to) {
      event.preventDefault();
      if (userTouching.matches) {
        history.replace(item.to);
      } else history.push(item.to);
    } else if (typeof item.action === 'function') {
      const action = item.action;
      event.preventDefault();
      action(event);
    }
  };

  const handleAuxClick: React.EventHandler<React.MouseEvent> = (event) => {
    if (!item) return;
    if (onClick) onClick();

    if (event.button === 1 && item.middleClick) {
      item.middleClick(event);
    }
  };

  const handleItemKeyPress: React.EventHandler<React.KeyboardEvent> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick(event);
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!item) return;

    if (item.onChange) item.onChange(event.target.checked);
  };

  useEffect(() => {
    const firstItem = index === 0;

    if (itemRef.current && (autoFocus ? firstItem : item?.active)) {
      itemRef.current.focus({ preventScroll: true });
    }
  }, [itemRef.current, index]);

  if (item === null) {
    return <li className='mx-2 my-1 h-[2px] bg-gray-100 dark:bg-gray-800' />;
  }

  return (
    <li className='truncate focus-visible:ring-2 focus-visible:ring-primary-500'>
      <a
        href={item.href || item.to || '#'}
        role='button'
        tabIndex={0}
        ref={itemRef}
        data-index={index}
        onClick={handleClick}
        onAuxClick={handleAuxClick}
        onKeyPress={handleItemKeyPress}
        target={item.target}
        title={item.text}
        className={
          clsx('mx-2 my-1 flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-800 focus:bg-gray-100 focus:text-gray-800 focus:outline-none black:hover:bg-gray-900 black:focus:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus:bg-gray-800 dark:focus:text-gray-200', {
            'text-danger-600 dark:text-danger-400': item.destructive,
          })
        }
      >
        {item.icon && <Icon src={item.icon} className='mr-3 size-5 flex-none rtl:ml-3 rtl:mr-0' />}

        <div className={clsx('text-xs', { 'mr-2': item.count || item.type === 'toggle' || item.items?.length })}>
          <div className='truncate text-base'>{item.text}</div>
          <div className='mt-0.5'>{item.meta}</div>
        </div>

        {item.count ? (
          <span className='ml-auto size-5 flex-none'>
            <Counter count={item.count} />
          </span>
        ) : null}

        {item.type === 'toggle' && (
          <div className='ml-auto'>
            <Toggle checked={item.checked} onChange={handleChange} />
          </div>
        )}

        {!!item.items?.length && (
          <Icon src={require('@tabler/icons/outline/chevron-right.svg')} containerClassName='ml-auto' className='size-5 flex-none' />
        )}
      </a>
    </li>
  );
};

export { type MenuItem, DropdownMenuItem as default };
