import type { InfiniteData } from '@tanstack/react-query';
import type { PaginatedResponse } from 'pl-api';

/** Flatten paginated results into a single array. */
const flattenPages = <T>(queryData: InfiniteData<Pick<PaginatedResponse<T>, 'items'>> | undefined) => {
  return queryData?.pages.reduce<T[]>(
    (prev: T[], curr) => [...prev, ...(curr.items)],
    [],
  );
};

export { flattenPages };
