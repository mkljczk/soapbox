import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';

import { useSettings } from 'pl-fe/hooks/use-settings';

import Icon from './ui/icon';
import Text from './ui/text';

interface ISidebarNavigationLink {
  /** Notification count, if any. */
  count?: number;
  /** Optional max to cap count (ie: N+) */
  countMax?: number;
  /** URL to an SVG icon. */
  icon: string;
  /** URL to an SVG icon for active state. */
  activeIcon?: string;
  /** Link label. */
  text: React.ReactNode;
  /** Route to an internal page. */
  to?: string;
  /** Callback when the link is clicked. */
  onClick?: React.EventHandler<React.MouseEvent>;
}

/** Desktop sidebar navigation link. */
const SidebarNavigationLink = React.forwardRef((props: ISidebarNavigationLink, ref: React.ForwardedRef<HTMLAnchorElement>): JSX.Element => {
  const { icon, activeIcon, text, to = '', count, countMax, onClick } = props;

  const { demetricator } = useSettings();

  const handleClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (onClick) {
      onClick(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Link
      to={to}
      ref={ref}
      onClick={handleClick}
      activeProps={{
        className: 'text-gray-900 dark:text-white',
      }}
      className='group flex items-center space-x-4 py-2 text-sm font-semibold text-gray-500 transition-colors duration-200 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rtl:space-x-reverse'
    >
      {({ isActive }) => (
        <>
          <span
            className={clsx({
              'relative rounded-lg inline-flex p-2.5 transition-colors duration-200': true,
              'bg-primary-50 group-hover:bg-primary-100 dark:bg-slate-700 dark:group-hover:bg-slate-600 black:bg-gray-900 black:group-hover:bg-gray-800': !isActive,
              'bg-primary-600': isActive,
            })}
          >
            <Icon
              src={(isActive && activeIcon) || icon}
              count={demetricator ? undefined : count}
              countMax={countMax}
              className={clsx('size-5', {
                'text-primary-700 dark:text-white': !isActive,
                'text-white': isActive,
              })}
            />
          </span>

          <Text weight='semibold' theme='inherit'>{text}</Text>
        </>
      )}
    </Link>
  );
});

export { SidebarNavigationLink as default };
