import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Column from 'pl-fe/components/ui/column';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { isNetworkError } from 'pl-fe/utils/errors';

const messages = defineMessages({
  title: { id: 'bundle_column_error.title', defaultMessage: 'Network error' },
  body: { id: 'bundle_column_error.body', defaultMessage: 'Something went wrong while loading this page.' },
  retry: { id: 'bundle_column_error.retry', defaultMessage: 'Try again' },
});

interface IErrorColumn {
  error: Error;
  onRetry?: () => void;
}

const ErrorColumn: React.FC<IErrorColumn> = ({ error, onRetry = () => location.reload() }) => {
  const intl = useIntl();

  const handleRetry = () => {
    onRetry?.();
  };

  if (!isNetworkError(error)) {
    throw error;
  }

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Stack space={4} alignItems='center' justifyContent='center' className='min-h-[160px] rounded-lg p-10'>
        <IconButton
          iconClassName='h-10 w-10'
          title={intl.formatMessage(messages.retry)}
          src={require('@fluentui/arrow_clockwise_24_regular.svg')}
          onClick={handleRetry}
        />

        <Text align='center' theme='muted'>{intl.formatMessage(messages.body)}</Text>
      </Stack>
    </Column>
  );
};

export { ErrorColumn as default };
