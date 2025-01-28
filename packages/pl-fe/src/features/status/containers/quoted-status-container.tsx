import { useQuery } from '@tanstack/react-query';
import React from 'react';

import QuotedStatus from 'pl-fe/components/quoted-status';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';

interface IQuotedStatusContainer {
  /** Status ID to the quoted status. */
  statusId: string;
}

const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ statusId }) => {
  const { data: status } = useQuery(statusQueryOptions(statusId));

  if (!status) {
    return null;
  }

  return (
    <QuotedStatus status={status} />
  );
};

export { QuotedStatusContainer as default };
