import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';

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
}

const ThumbNavigationLink: React.FC<IThumbNavigationLink> = ({ count, countMax, src, activeSrc, text, to, exact }): JSX.Element => {
  const { demetricator } = useSettings();

  return (
    <Link to={to} className='flex flex-1 flex-col items-center space-y-1 px-2 py-4 text-lg text-gray-600' title={text}>
      {({ isActive }) => !demetricator && count !== undefined ? (
        <IconWithCounter
          src={(isActive && activeSrc) || src}
          className={clsx({
            'h-5 w-5': true,
            'text-gray-600 black:text-white': !isActive,
            'text-primary-500': isActive,
          })}
          count={count}
          countMax={countMax}
        />
      ) : (
        <Icon
          src={(isActive && activeSrc) || src}
          className={clsx({
            'h-5 w-5': true,
            'text-gray-600 black:text-white': !isActive,
            'text-primary-500': isActive,
          })}
        />
      )}
    </Link>
  );
};

export { ThumbNavigationLink as default };
