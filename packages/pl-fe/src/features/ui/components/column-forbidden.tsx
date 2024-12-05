import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Column from 'pl-fe/components/ui/column';

const messages = defineMessages({
  title: { id: 'column_forbidden.title', defaultMessage: 'Forbidden' },
  body: { id: 'column_forbidden.body', defaultMessage: 'You do not have permission to access this page.' },
});

const ColumnForbidden = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <div className='bg-primary-50 flex min-h-[160px] flex-1 items-center justify-center rounded-lg p-10 text-center text-gray-900 dark:bg-gray-700 dark:text-gray-300'>
        {intl.formatMessage(messages.body)}
      </div>
    </Column>
  );
};

export { ColumnForbidden as default };
