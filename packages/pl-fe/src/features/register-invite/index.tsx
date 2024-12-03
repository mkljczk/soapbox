import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { BigCard } from 'pl-fe/components/big-card';
import RegistrationForm from 'pl-fe/features/auth-login/components/registration-form';
import { useInstance } from 'pl-fe/hooks/use-instance';

interface RegisterInviteParams {
  token: string;
}

/** Page to register with an invitation. */
const RegisterInvite: React.FC = () => {
  const instance = useInstance();
  const { token } = useParams<RegisterInviteParams>();

  const title = (
    <FormattedMessage
      id='register_invite.title'
      defaultMessage="You've been invited to join {siteTitle}!"
      values={{ siteTitle: instance.title }}
    />
  );

  const subtitle = (
    <FormattedMessage
      id='register_invite.lead'
      defaultMessage='Complete the form below to create an account.'
    />
  );

  return (
    <BigCard title={title} subtitle={subtitle}>
      <RegistrationForm inviteToken={token} />
    </BigCard>
  );
};

export { RegisterInvite as default };
