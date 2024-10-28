import { PaginatedResponse, Status } from 'pl-api';

import { importEntities } from 'pl-hooks/importer';

const minifyStatusList = ({ previous, next, items, ...response }: PaginatedResponse<Status>): PaginatedResponse<string> => {
  importEntities({ statuses: items });
  return {
    ...response,
    previous: previous ? () => previous().then(minifyStatusList) : null,
    next: next ? () => next().then(minifyStatusList) : null,
    items: items.map(status => status.id),
  };
};

export { minifyStatusList };
