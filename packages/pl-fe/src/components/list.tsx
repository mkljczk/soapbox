import clsx from 'clsx';
import React from 'react';
import { Link } from '@tanstack/react-router';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Select from 'pl-fe/components/ui/select';
import { SelectDropdown } from 'pl-fe/features/forms';

interface IList {
  children: React.ReactNode;
}

const List: React.FC<IList> = ({ children }) => (
  <div className='space-y-0.5'>{children}</div>
);

interface IListItem {
  className?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  to?: string;
  href?: string;
  onClick?(): void;
  onSelect?(): void;
  isSelected?: boolean;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

const ListItem: React.FC<IListItem> = ({ className, label, hint, children, to, href, onClick, onSelect, isSelected, size = 'md' }) => {
  const id = crypto.randomUUID();
  const domId = `list-group-${id}`;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick!();
    }
  };

  const LabelComp = to || href || onClick || onSelect ? 'span' : 'label';

  const renderChildren = React.useCallback(() => React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const isSelect = child.type === SelectDropdown || child.type === Select;

      return React.cloneElement(child, {
        // @ts-ignore
        id: domId,
        className: clsx({
          'w-auto': isSelect,
        }, child.props.className),
      });
    }

    return null;
  }), [children, domId]);

  const classNames = clsx('flex items-center justify-between overflow-hidden bg-gradient-to-r from-gradient-start/20 to-gradient-end/20 first:rounded-t-lg last:rounded-b-lg dark:from-gradient-start/10 dark:to-gradient-end/10',
    className,
    {
      'px-4 py-2': size === 'md',
      'px-2 py-0.5': size === 'sm',
      'cursor-pointer hover:from-gradient-start/30 hover:to-gradient-end/30 dark:hover:from-gradient-start/5 dark:hover:to-gradient-end/5': typeof to !== 'undefined' || typeof onClick !== 'undefined' || typeof onSelect !== 'undefined',
    },
  );

  const body = (
    <>
      <div className='flex flex-col py-1.5 pr-4 rtl:pl-4 rtl:pr-0'>
        <LabelComp className='text-gray-900 dark:text-gray-100' htmlFor={domId}>{label}</LabelComp>

        {hint ? (
          <span className='text-sm text-gray-700 dark:text-gray-600'>{hint}</span>
        ) : null}
      </div>

      {(to || href || onClick) ? (
        <HStack space={1} alignItems='center' className='overflow-hidden text-gray-700 dark:text-gray-600'>
          {children}

          <Icon src={require('@tabler/icons/outline/chevron-right.svg')} className='ml-1 rtl:rotate-180' />
        </HStack>
      ) : null}

      {onSelect ? (
        <div className='flex flex-row items-center text-gray-700 dark:text-gray-600'>
          {children}

          <div
            className={
              clsx({
                'flex h-6 w-6 items-center justify-center rounded-full border-2 border-solid border-primary-500 dark:border-primary-400 transition': true,
                'bg-primary-500 dark:bg-primary-400': isSelected,
                'bg-transparent': !isSelected,
              })
            }
          >
            <Icon
              src={require('@tabler/icons/outline/check.svg')}
              className={
                clsx({
                  'h-4 w-4 text-white dark:text-white transition-all duration-500': true,
                  'opacity-0 scale-50': !isSelected,
                  'opacity-100 scale-100': isSelected,
                })
              }
            />
          </div>
        </div>
      ) : null}

      {typeof to === 'undefined' && typeof onClick === 'undefined' && typeof onSelect === 'undefined' ? renderChildren() : null}
    </>
  );

  if (to) return (
    <Link className={classNames} to={to}>
      {body}
    </Link>
  );

  const Comp = onClick || href ? 'a' : 'div';
  const linkProps = onClick || onSelect || href ? { onClick: onClick || onSelect, onKeyDown, tabIndex: 0, role: 'link', ...(href && { href, target: '_blank' }) } : {};

  return (
    <Comp
      className={classNames}
      {...linkProps}
    >
      {body}
    </Comp>
  );
};

export { List as default, type IListItem, ListItem };
