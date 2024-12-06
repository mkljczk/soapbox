import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useLoading } from 'pl-fe/hooks/use-loading';

import { dismissEntities } from '../actions';

import { parseEntitiesPath } from './utils';

import type { EntityFn, ExpandedEntitiesPath } from './types';

/**
 * Removes an entity from a specific list.
 * To remove an entity globally from all lists, see `useDeleteEntity`.
 */
const useDismissEntity = (expandedPath: ExpandedEntitiesPath, entityFn: EntityFn<string>) => {
  const dispatch = useAppDispatch();

  const [isLoading, setPromise] = useLoading();
  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  // TODO: optimistic dismissing
  const dismissEntity = async (entityId: string) => {
    const result = await setPromise(entityFn(entityId));
    dispatch(dismissEntities([entityId], entityType, listKey));
    return result;
  };

  return {
    dismissEntity,
    isLoading,
  };
};

export { useDismissEntity };
