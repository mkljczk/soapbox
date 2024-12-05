import React from 'react';
import { Link } from 'react-router-dom';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';

import HoverAccountWrapper from './hover-account-wrapper';

interface IStatusMention {
  accountId: string;
  fallback?: JSX.Element;
}

const StatusMention: React.FC<IStatusMention> = ({ accountId, fallback }) => {
  const { account } = useAccount(accountId);

  if (!account) return (
    <HoverAccountWrapper accountId={accountId} element='span'>
      {fallback}
    </HoverAccountWrapper>
  );

  return (
    <HoverAccountWrapper accountId={accountId} element='span'>
      <Link
        to={`/@${account.acct}`}
        className='text-primary-600 dark:text-accent-blue hover:underline'
        dir='ltr'
        onClick={(e) => e.stopPropagation()}
      >
        @{account.acct}
      </Link>
    </HoverAccountWrapper>
  );
};

export { StatusMention as default };
