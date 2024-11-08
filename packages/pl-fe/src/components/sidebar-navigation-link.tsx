import clsx from 'clsx';
import React from 'react';
import { NavLink } from 'react-router-dom';

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
  const isActive = location.pathname === to;

  const { demetricator } = useSettings();

  const handleClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (onClick) {
      onClick(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <NavLink
      exact
      to={to}
      ref={ref}
      onClick={handleClick}
      className={clsx({
        'group flex items-center py-2 text-sm font-semibold space-x-4 rtl:space-x-reverse transition-colors duration-200': true,
        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': !isActive,
        'text-gray-900 dark:text-white': isActive,
      })}
    >
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
            'text-primary-700 dark:text-white fill-primary-700 dark:fill-white': !isActive,
            'text-white fill-white': isActive,
          })}
        />
      </span>

      <Text weight='semibold' theme='inherit'>{text}</Text>
    </NavLink>
  );
});

export { SidebarNavigationLink as default };
