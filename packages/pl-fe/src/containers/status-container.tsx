import React from 'react';

import Status, { IStatus } from 'pl-fe/components/status';
import { useStatus } from 'pl-fe/queries/statuses/status';

interface IStatusContainer extends Omit<IStatus, 'status'> {
  id: string;
  contextType?: string;
  /** @deprecated Unused. */
  otherAccounts?: any;
}

/**
 * Legacy Status wrapper accepting a status ID instead of the full entity.
 * @deprecated Use the Status component directly.
 */
const StatusContainer: React.FC<IStatusContainer> = (props) => {
  const { id, contextType, ...rest } = props;

  const { data: status } = useStatus(id);

  if (status) {
    return <Status status={status} {...rest} />;
  } else {
    return null;
  }
};

export { StatusContainer as default };
