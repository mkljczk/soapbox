import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from 'pl-fe/components/big-card';
import Text from 'pl-fe/components/ui/text';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useRegistrationStatus } from 'pl-fe/hooks/use-registration-status';

import RegistrationForm from './registration-form';

const RegistrationPage: React.FC = () => {
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();

  if (!isOpen) {
    return (
      <BigCard title={<FormattedMessage id='registration.closed_title' defaultMessage='Registrations closed' />}>
        <Text theme='muted' align='center'>
          <FormattedMessage
            id='registration.closed_message'
            defaultMessage='{instance} is not accepting new members'
            values={{ instance: instance.title }}
          />
        </Text>
      </BigCard>
    );
  }

  return (
    <BigCard title={<FormattedMessage id='column.registration' defaultMessage='Sign up' />}>
      <RegistrationForm />
    </BigCard>
  );
};

export { RegistrationPage as default };
