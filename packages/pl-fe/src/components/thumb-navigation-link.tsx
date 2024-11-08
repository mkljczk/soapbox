import clsx from 'clsx';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import IconWithCounter from 'pl-fe/components/icon-with-counter';
import Icon from 'pl-fe/components/ui/icon';
import { useSettings } from 'pl-fe/hooks/use-settings';

interface IThumbNavigationLink {
  count?: number;
  countMax?: number;
  src: string;
  activeSrc?: string;
  text: string;
  to: string;
  exact?: boolean;
  paths?: Array<string>;
}

const ThumbNavigationLink: React.FC<IThumbNavigationLink> = ({ count, countMax, src, activeSrc, text, to, exact, paths }): JSX.Element => {
  const { pathname } = useLocation();
  const { demetricator } = useSettings();

  const isActive = (): boolean => {
    if (paths) {
      return paths.some(path => pathname.startsWith(path));
    } else {
      return exact ? pathname === to : pathname.startsWith(to);
    }
  };

  const active = isActive();

  const icon = (active && activeSrc) || src;

  return (
    <NavLink to={to} exact={exact} className='flex flex-1 flex-col items-center space-y-1 px-2 py-4 text-lg text-gray-600' title={text}>
      {!demetricator && count !== undefined ? (
        <IconWithCounter
          src={icon}
          className={clsx({
            'h-5 w-5': true,
            'text-gray-600 black:text-white': !active,
            'text-primary-500': active,
          })}
          count={count}
          countMax={countMax}
        />
      ) : (
        <Icon
          src={icon}
          className={clsx({
            'h-5 w-5': true,
            'text-gray-600 black:text-white': !active,
            'text-primary-500': active,
          })}
        />
      )}
    </NavLink>
  );
};

export { ThumbNavigationLink as default };
