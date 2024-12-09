import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';
import { useStatus } from 'pl-fe/queries/statuses/status';

interface IQuotedStatusIndicator {
  /** The quoted status id. */
  statusId: string;
}

const QuotedStatusIndicator: React.FC<IQuotedStatusIndicator> = ({ statusId }) => {
  const { data: status } = useStatus(statusId);

  if (!status) return null;

  return (
    <HStack alignItems='center' space={1}>
      <Icon className='size-5' src={require('@tabler/icons/outline/quote.svg')} aria-hidden />
      <Text truncate>{status.url}</Text>
    </HStack>
  );
};

export { QuotedStatusIndicator as default };
