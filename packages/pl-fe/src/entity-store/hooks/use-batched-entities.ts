import { useEffect } from 'react';
import * as v from 'valibot';

import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useGetState } from 'pl-fe/hooks/use-get-state';
import { filteredArray } from 'pl-fe/schemas/utils';

import { entitiesFetchFail, entitiesFetchRequest, entitiesFetchSuccess } from '../actions';
import { selectCache, selectListState, useListState } from '../selectors';

import { parseEntitiesPath } from './utils';

import type { EntitiesPath, EntityFn, EntitySchema, ExpandedEntitiesPath } from './types';
import type { Entity } from '../types';
import type { RootState } from 'pl-fe/store';

interface UseBatchedEntitiesOpts<TEntity extends Entity> {
  schema?: EntitySchema<TEntity>;
  enabled?: boolean;
}

const useBatchedEntities = <TEntity extends Entity>(
  expandedPath: ExpandedEntitiesPath,
  ids: string[],
  entityFn: EntityFn<string[]>,
  opts: UseBatchedEntitiesOpts<TEntity> = {},
) => {
  const getState = useGetState();
  const dispatch = useAppDispatch();
  const { entityType, listKey, path } = parseEntitiesPath(expandedPath);
  const schema = opts.schema || v.custom<TEntity>(() => true);

  const isEnabled = opts.enabled ?? true;
  const isFetching = useListState(path, 'fetching');
  const lastFetchedAt = useListState(path, 'lastFetchedAt');
  const isFetched = useListState(path, 'fetched');
  const isInvalid = useListState(path, 'invalid');
  const error = useListState(path, 'error');

  /** Get IDs of entities not yet in the store. */
  const filteredIds = useAppSelector((state) => {
    const cache = selectCache(state, path);
    if (!cache) return ids;
    return ids.filter((id) => !cache.store[id]);
  });

  const entityMap = useAppSelector((state) => selectEntityMap<TEntity>(state, path, ids));

  const fetchEntities = async () => {
    const isFetching = selectListState(getState(), path, 'fetching');
    if (isFetching) return;

    dispatch(entitiesFetchRequest(entityType, listKey));
    try {
      const response = await entityFn(filteredIds);
      const entities = v.parse(filteredArray(schema), response);
      dispatch(entitiesFetchSuccess(entities, entityType, listKey, 'end', {
        next: null,
        prev: null,
        totalCount: undefined,
        fetching: false,
        fetched: true,
        error: null,
        lastFetchedAt: new Date(),
        invalid: false,
      }));
    } catch (e) {
      dispatch(entitiesFetchFail(entityType, listKey, e));
    }
  };

  useEffect(() => {
    if (filteredIds.length && isEnabled) {
      fetchEntities();
    }
  }, [filteredIds.length]);

  return {
    entityMap,
    isFetching,
    lastFetchedAt,
    isFetched,
    isError: !!error,
    isInvalid,
  };
};

const selectEntityMap = <TEntity extends Entity>(state: RootState, path: EntitiesPath, entityIds: string[]): Record<string, TEntity> => {
  const cache = selectCache(state, path);

  return entityIds.reduce<Record<string, TEntity>>((result, id) => {
    const entity = cache?.store[id];
    if (entity) {
      result[id] = entity as TEntity;
    }
    return result;
  }, {});
};

export { useBatchedEntities };
