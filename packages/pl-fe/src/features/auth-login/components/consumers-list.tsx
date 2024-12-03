import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import Card from 'pl-fe/components/ui/card';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

import ConsumerButton from './consumer-button';

interface IConsumersList {
}

/** Displays OAuth consumers to log in with. */
const ConsumersList: React.FC<IConsumersList> = () => {
  const { data: instance } = useInstance();
  const providers = instance.pleroma.oauth_consumer_strategies;

  if (providers.length > 0) {
    return (
      <Card className='bg-gray-50 p-2 black:bg-black black:p-0 dark:bg-primary-800 sm:rounded-xl'>
        <Stack space={2}>
          <Text size='xs' theme='muted'>
            <FormattedMessage id='oauth_consumers.title' defaultMessage='Other ways to sign in' />
          </Text>
          <HStack space={2}>
            {providers.map(provider => (
              <ConsumerButton provider={provider} />
            ))}
          </HStack>
        </Stack>
      </Card>
    );
  } else {
    return null;
  }
};

export { ConsumersList as default };
