import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/icon';

const messages = defineMessages({
  load_more: { id: 'status.load_more', defaultMessage: 'Load more' },
});

interface ILoadGap {
  disabled?: boolean;
  maxId: string;
  onClick: (id: string) => void;
}

const LoadGap: React.FC<ILoadGap> = ({ disabled, maxId, onClick }) => {
  const intl = useIntl();

  const handleClick = () => onClick(maxId);

  return (
    <button className='m-0 box-border block w-full border-0 bg-transparent p-4 text-gray-900' disabled={disabled} onClick={handleClick} aria-label={intl.formatMessage(messages.load_more)}>
      <Icon className='mx-auto' src={require('@fluentui/more_horizontal_24_regular.svg')} />
    </button>
  );
};

export { LoadGap as default };
