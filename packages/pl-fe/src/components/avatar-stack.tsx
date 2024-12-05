import clsx from 'clsx';
import React from 'react';

import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { selectAccounts } from 'pl-fe/selectors';

interface IAvatarStack {
  accountIds: Array<string>;
  limit?: number;
}

const AvatarStack: React.FC<IAvatarStack> = ({ accountIds, limit = 3 }) => {
  const accounts = useAppSelector(state => selectAccounts(state, accountIds.slice(0, limit)));

  return (
    <HStack className='relative' aria-hidden>
      {accounts.map((account, i) => (
        <div
          className={clsx('relative', { '-ml-3': i !== 0 })}
          key={account.id}
          style={{ zIndex: limit - i }}
        >
          <Avatar
            className='dark:ring-primary-900 ring-1 ring-white'
            src={account.avatar}
            alt={account.avatar_description}
            size={20}
          />
        </div>
      ))}
    </HStack>
  );
};

export { AvatarStack as default };
