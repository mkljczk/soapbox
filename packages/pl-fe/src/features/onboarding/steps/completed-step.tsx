import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Card, { CardBody } from 'pl-fe/components/ui/card';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

const CompletedStep = ({ onComplete }: { onComplete: () => void }) => (
  <Card variant='rounded' size='xl'>
    <CardBody>
      <Stack space={2}>
        <Icon strokeWidth={1} src={require('@tabler/icons/outline/confetti.svg')} className='text-primary-600 dark:text-primary-400 mx-auto size-16' />

        <Text size='2xl' align='center' weight='bold'>
          <FormattedMessage id='onboarding.finished.title' defaultMessage='Onboarding complete' />
        </Text>

        <Text theme='muted' align='center'>
          <FormattedMessage
            id='onboarding.finished.message'
            defaultMessage='We are very excited to welcome you to our community! Tap the button below to get started.'
          />
        </Text>
      </Stack>

      <div className='mx-auto pt-10 sm:w-2/3 md:w-1/2'>
        <Stack justifyContent='center' space={2}>
          <Button
            block
            theme='primary'
            onClick={onComplete}
          >
            <FormattedMessage id='onboarding.view_feed' defaultMessage='View feed' />
          </Button>
        </Stack>
      </div>
    </CardBody>
  </Card>
);

export { CompletedStep as default };
