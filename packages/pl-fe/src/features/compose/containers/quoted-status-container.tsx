import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { cancelQuoteCompose } from 'pl-fe/actions/compose';
import QuotedStatus from 'pl-fe/components/quoted-status';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';

interface IQuotedStatusContainer {
  composeId: string;
}

/** QuotedStatus shown in post composer. */
const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ composeId }) => {
  const dispatch = useAppDispatch();

  const quoteId = useCompose(composeId).quote || undefined;

  const { data: status } = useQuery(statusQueryOptions(quoteId));

  const onCancel = () => {
    dispatch(cancelQuoteCompose(composeId));
  };

  if (!status) {
    return null;
  }

  return (
    <div className='mb-2'>
      <QuotedStatus
        status={status}
        onCancel={onCancel}
        compose
      />
    </div>
  );
};

export { QuotedStatusContainer as default };
