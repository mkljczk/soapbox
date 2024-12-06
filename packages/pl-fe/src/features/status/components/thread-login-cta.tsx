import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Card, { CardTitle } from 'pl-fe/components/ui/card';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';

/** Prompts logged-out users to log in when viewing a thread. */
const ThreadLoginCta: React.FC = () => {
  const instance = useInstance();
  const { displayCta } = usePlFeConfig();

  if (!displayCta) return null;

  return (
    <Card className='space-y-6 px-6 py-12 text-center' variant='rounded'>
      <Stack>
        <CardTitle title={<FormattedMessage id='thread_login.title' defaultMessage='Continue the conversation' />} />
        <Text>
          <FormattedMessage
            id='thread_login.message'
            defaultMessage='Join {siteTitle} to get the full story and details.'
            values={{ siteTitle: instance.title }}
          />
        </Text>
      </Stack>

      <Stack space={4} className='mx-auto max-w-xs'>
        <Button theme='tertiary' to='/login' block>
          <FormattedMessage id='thread_login.login' defaultMessage='Log in' />
        </Button>
        <Button to='/signup' block>
          <FormattedMessage id='thread_login.signup' defaultMessage='Sign up' />
        </Button>
      </Stack>
    </Card>
  );
};

export { ThreadLoginCta as default };
