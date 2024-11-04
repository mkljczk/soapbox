/**
 * ForkAwesomeIcon: renders a ForkAwesome icon.
 * Full list: https://forkaweso.me/Fork-Awesome/icons/
 * @module pl-fe/components/fork_awesome_icon
 * @see pl-fe/components/icon
 */

import clsx from 'clsx';
import React from 'react';

interface IForkAwesomeIcon extends React.HTMLAttributes<HTMLLIElement> {
  id: string;
  className?: string;
  fixedWidth?: boolean;
}

const ForkAwesomeIcon: React.FC<IForkAwesomeIcon> = ({ id, className, fixedWidth, ...rest }) => (
  <i
    role='img'
    // alt={alt}
    className={clsx('fa', `fa-${id}`, className, { 'fa-fw': fixedWidth })}
    {...rest}
  />
);

export { ForkAwesomeIcon as default };
