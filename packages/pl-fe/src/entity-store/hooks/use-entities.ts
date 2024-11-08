import { useEffect } from 'react';
import * as v from 'valibot';

import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useGetState } from 'pl-fe/hooks/use-get-state';
import { filteredArray } from 'pl-fe/schemas/utils';

import { entitiesFetchFail, entitiesFetchRequest, entitiesFetchSuccess, invalidateEntityList } from '../actions';
import { selectEntities, selectListState, useListState } from '../selectors';

import { parseEntitiesPath } from './utils';

import type { EntityFn, EntitySchema, ExpandedEntitiesPath } from './types';
import type { Entity } from '../types';
import type { PaginatedResponse } from 'pl-api';

/** Additional options for the hook. */
interface UseEntitiesOpts<TEntity extends Entity, TTransformedEntity extends Entity> {
  /** A valibot schema to parse the API entities. */
  schema?: EntitySchema<TEntity>;
  /**
   * Time (milliseconds) until this query becomes stale and should be refetched.
   * It is 1 minute by default, and can be set to `Infinity` to opt-out of automatic fetching.
   */
  staleTime?: number;
  /** A flag to potentially disable sending requests to the API. */
  enabled?: boolean;
  transform?: (schema: TEntity) => TTransformedEntity;
}

/** A hook for fetching and displaying API entities. */
const useEntities = <TEntity extends Entity, TTransformedEntity extends Entity = TEntity>(
  /** Tells us where to find/store the entity in the cache. */
  expandedPath: ExpandedEntitiesPath,
  /** API route to GET, eg `'/api/v1/notifications'`. If undefined, nothing will be fetched. */
  entityFn: EntityFn<void>,
  /** Additional options for the hook. */
  opts: UseEntitiesOpts<TEntity, TTransformedEntity> = {},
) => {
  const dispatch = useAppDispatch();
  const getState = useGetState();

  const { entityType, listKey, path } = parseEntitiesPath(expandedPath);
  const entities = useAppSelector(state => selectEntities<TTransformedEntity>(state, path));
  const schema = opts.schema || v.custom<TEntity>(() => true);

  const isEnabled = opts.enabled ?? true;
  const isFetching = useListState(path, 'fetching');
  const lastFetchedAt = useListState(path, 'lastFetchedAt');
  const isFetched = useListState(path, 'fetched');
  const isError = !!useListState(path, 'error');
  const totalCount = useListState(path, 'totalCount');
  const isInvalid = useListState(path, 'invalid');

  const next = useListState(path, 'next');
  const prev = useListState(path, 'prev');

  const fetchPage = async(req: () => Promise<PaginatedResponse<any>>, pos: 'start' | 'end', overwrite = false): Promise<void> => {
    // Get `isFetching` state from the store again to prevent race conditions.
    const isFetching = selectListState(getState(), path, 'fetching');
    if (isFetching) return;

    dispatch(entitiesFetchRequest(entityType, listKey));
    try {
      const response = await req();
      const entities = v.parse(filteredArray(schema), response);
      const transformedEntities = opts.transform && entities.map(opts.transform);

      dispatch(entitiesFetchSuccess(transformedEntities || entities, entityType, listKey, pos, {
        next: response.next,
        prev: response.previous,
        totalCount: undefined,
        fetching: false,
        fetched: true,
        error: null,
        lastFetchedAt: new Date(),
        invalid: false,
      }, overwrite));
    } catch (error) {
      dispatch(entitiesFetchFail(entityType, listKey, error));
    }
  };

  const fetchEntities = async(): Promise<void> => {
    await fetchPage(entityFn, 'end', true);
  };

  const fetchNextPage = async(): Promise<void> => {
    if (next) {
      await fetchPage(() => next(), 'end');
    }
  };

  const fetchPreviousPage = async(): Promise<void> => {
    if (prev) {
      await fetchPage(() => prev(), 'start');
    }
  };

  const invalidate = () => {
    dispatch(invalidateEntityList(entityType, listKey));
  };

  const staleTime = opts.staleTime ?? 60000;

  useEffect(() => {
    if (!isEnabled) return;
    if (isFetching) return;
    const isUnset = !lastFetchedAt;
    const isStale = lastFetchedAt ? Date.now() >= lastFetchedAt.getTime() + staleTime : false;

    if (isInvalid || isUnset || isStale) {
      fetchEntities();
    }
  }, [isEnabled, ...path]);

  return {
    entities,
    fetchEntities,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage: !!next,
    hasPreviousPage: !!prev,
    totalCount,
    isError,
    isFetched,
    isFetching,
    isLoading: isFetching && entities.length === 0,
    invalidate,
    /** The `X-Total-Count` from the API if available, or the length of items in the store. */
    count: typeof totalCount === 'number' ? totalCount : entities.length,
  };
};

export {
  useEntities,
};
