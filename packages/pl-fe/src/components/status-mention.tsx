import React from 'react';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Link from 'pl-fe/components/link';

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
        dir='ltr'
        onClick={(e) => e.stopPropagation()}
      >
        @{account.acct}
      </Link>
    </HoverAccountWrapper>
  );
};

export { StatusMention as default };
