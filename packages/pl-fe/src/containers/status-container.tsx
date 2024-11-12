import { useStatus } from 'pl-hooks';
import React from 'react';

import Status, { IStatus } from 'pl-fe/components/status';

interface IStatusContainer extends Omit<IStatus, 'status'> {
  id: string;
  contextType?: string;
  /** @deprecated Unused. */
  otherAccounts?: any;
}

/**
 * Status wrapper accepting a status ID instead of the full entity.
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
