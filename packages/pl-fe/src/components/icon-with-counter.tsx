import React from 'react';

import Icon, { IIcon } from 'pl-fe/components/icon';
import Counter from 'pl-fe/components/ui/counter';

interface IIconWithCounter extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  countMax?: number;
  icon?: string;
  src?: string;
}

const IconWithCounter: React.FC<IIconWithCounter> = ({ icon, count, countMax, ...rest }) => (
  <div className='relative'>
    <Icon id={icon} {...rest as IIcon} />

    {count > 0 && (
      <span className='absolute -right-3 -top-2'>
        <Counter count={count} countMax={countMax} />
      </span>
    )}
  </div>
);

export { IconWithCounter as default };
