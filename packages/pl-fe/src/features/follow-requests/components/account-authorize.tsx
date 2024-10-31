import React from 'react';

import { authorizeFollowRequest, rejectFollowRequest } from 'pl-fe/actions/accounts';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Account from 'pl-fe/components/account';
import { AuthorizeRejectButtons } from 'pl-fe/components/authorize-reject-buttons';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

interface IAccountAuthorize {
  id: string;
}

const AccountAuthorize: React.FC<IAccountAuthorize> = ({ id }) => {
  const dispatch = useAppDispatch();
  const { account } = useAccount(id);

  const onAuthorize = () => dispatch(authorizeFollowRequest(id));
  const onReject = () => dispatch(rejectFollowRequest(id));

  if (!account) return null;

  return (
    <div className='p-2.5'>
      <Account
        account={account}
        action={
          <AuthorizeRejectButtons
            onAuthorize={onAuthorize}
            onReject={onReject}
            countdown={3000}
          />
        }
      />
    </div>
  );
};

export { AccountAuthorize as default };
