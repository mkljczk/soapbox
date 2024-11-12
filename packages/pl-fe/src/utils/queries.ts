import { queryClient } from 'pl-fe/queries/client';

import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import type { PaginatedResponse } from 'pl-api';

interface Entity {
  id: string;
}

const isEntity = <T = unknown>(object: T): object is T & Entity =>
  object && typeof object === 'object' && 'id' in object;

/** Deduplicate an array of entities by their ID. */
const deduplicateById = <T extends Entity>(entities: T[]): T[] => {
  const map = entities.reduce<Map<string, T>>((result, entity) => result.set(entity.id, entity), new Map());

  return Array.from(map.values());
};

/** Flatten paginated results into a single array. */
const flattenPages = <T>(queryData: InfiniteData<Pick<PaginatedResponse<T>, 'items'>> | undefined) => {
  const data = queryData?.pages.reduce<T[]>(
    (prev: T[], curr) => [...prev, ...(curr.items)],
    [],
  );

  if (data && data.every(isEntity)) {
    return deduplicateById(data);
  } else if (data) {
    return data;
  }
};

/** Traverse pages and update the item inside if found. */
const updatePageItem = <T>(queryKey: QueryKey, newItem: T, isItem: (item: T, newItem: T) => boolean) => {
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<T>>>({ queryKey }, (data) => {
    if (data) {
      const pages = data.pages.map(page => {
        const result = page.items.map(item => isItem(item, newItem) ? newItem : item);
        return { ...page, result };
      });
      return { ...data, pages };
    }
  });
};

/** Insert the new item at the beginning of the first page. */
const appendPageItem = <T>(queryKey: QueryKey, newItem: T) => {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<T>>>(queryKey, (data) => {
    if (data) {
      const pages = [...data.pages];
      pages[0] = { ...pages[0], items: [newItem, ...pages[0].items] };
      return { ...data, pages };
    }
  });
};

/** Remove an item inside if found. */
const removePageItem = <T>(queryKey: QueryKey, itemToRemove: T, isItem: (item: T, newItem: T) => boolean) => {
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<T>>>({ queryKey }, (data) => {
    if (data) {
      const pages = data.pages.map(page => {
        const items = page.items.filter(item => !isItem(item, itemToRemove));
        return { ...page, items };
      });
      return { ...data, pages };
    }
  });
};

const paginateQueryData = <T>(array: T[] | undefined) =>
  array?.reduce((resultArray: any, item: any, index: any) => {
    const chunkIndex = Math.floor(index / 20);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

const sortQueryData = <T>(queryKey: QueryKey, comparator: (a: T, b: T) => number) => {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<T>>>(queryKey, (prevResult) => {
    if (prevResult) {
      const nextResult = { ...prevResult };
      const flattenedQueryData = flattenPages(nextResult);
      const sortedQueryData = flattenedQueryData?.sort(comparator);
      const paginatedPages = paginateQueryData(sortedQueryData);
      const newPages = paginatedPages.map((page: T, idx: number) => ({
        ...prevResult.pages[idx],
        result: page,
      }));

      nextResult.pages = newPages;
      return nextResult;
    }
  });
};

export {
  flattenPages,
  updatePageItem,
  appendPageItem,
  removePageItem,
  sortQueryData,
};
