import React from 'react';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Account from 'pl-fe/components/account';

interface IAutosuggestAccount {
  id: string;
}

const AutosuggestAccount: React.FC<IAutosuggestAccount> = ({ id }) => {
  const { account } = useAccount(id);
  if (!account) return null;

  return (
    <div className='snap-start snap-always'>
      <Account account={account} hideActions showAccountHoverCard={false} />
    </div>
  );

};

export { AutosuggestAccount as default };
