import React, { useCallback } from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetStatus } from 'pl-fe/selectors';

interface IQuotedStatusIndicator {
  /** The quoted status id. */
  statusId: string;
}

const QuotedStatusIndicator: React.FC<IQuotedStatusIndicator> = ({ statusId }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: statusId }));

  if (!status) return null;

  return (
    <HStack alignItems='center' space={1}>
      <Icon className='size-5' src={require('@fluentui/text_quote_24_regular.svg')} aria-hidden />
      <Text truncate>{status.url}</Text>
    </HStack>
  );
};

export { QuotedStatusIndicator as default };
