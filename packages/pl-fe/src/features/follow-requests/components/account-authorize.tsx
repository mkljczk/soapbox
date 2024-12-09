import React from 'react';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Account from 'pl-fe/components/account';
import { AuthorizeRejectButtons } from 'pl-fe/components/authorize-reject-buttons';
import { useAcceptFollowRequestMutation, useRejectFollowRequestMutation } from 'pl-fe/queries/accounts/follow-requests';

interface IAccountAuthorize {
  id: string;
}

const AccountAuthorize: React.FC<IAccountAuthorize> = ({ id }) => {
  const { account } = useAccount(id);

  const { mutate: authorizeFollowRequest } = useAcceptFollowRequestMutation(id);
  const { mutate: rejectFollowRequest } = useRejectFollowRequestMutation(id);

  const onAuthorize = () => authorizeFollowRequest();
  const onReject = () => rejectFollowRequest();

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
