import { useStatus } from 'pl-hooks';
import React from 'react';

import QuotedStatus from 'pl-fe/components/quoted-status';

interface IQuotedStatusContainer {
  /** Status ID to the quoted status. */
  statusId: string;
}

const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ statusId }) => {
  const { data: status } = useStatus(statusId);

  if (!status) {
    return null;
  }

  return (
    <QuotedStatus status={status || undefined} />
  );
};

export { QuotedStatusContainer as default };
