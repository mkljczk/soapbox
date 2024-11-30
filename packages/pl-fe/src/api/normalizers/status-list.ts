import { PaginatedResponse, Status } from 'pl-api';

import { importEntities } from 'pl-fe/actions/importer';
import { store } from 'pl-fe/store';

const minifyStatusList = ({ previous, next, items, ...response }: PaginatedResponse<Status>): PaginatedResponse<string> => {
  store.dispatch(importEntities({ statuses: items }) as any);

  return {
    ...response,
    previous: previous ? () => previous().then(minifyStatusList) : null,
    next: next ? () => next().then(minifyStatusList) : null,
    items: items.map(status => status.id),
  };
};

export { minifyStatusList };
