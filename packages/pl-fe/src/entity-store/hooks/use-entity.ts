import { useEffect, useState } from 'react';
import * as v from 'valibot';

import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useLoading } from 'pl-fe/hooks/use-loading';

import { importEntities } from '../actions';
import { selectEntity } from '../selectors';

import type { EntitySchema, EntityPath, EntityFn } from './types';
import type { Entity } from '../types';
import type { PlfeResponse } from 'pl-fe/api';

/** Additional options for the hook. */
interface UseEntityOpts<TEntity extends Entity, TTransformedEntity extends Entity> {
  /** A valibot schema to parse the API entity. */
  schema?: EntitySchema<TEntity>;
  /** Whether to refetch this entity every time the hook mounts, even if it's already in the store. */
  refetch?: boolean;
  /** A flag to potentially disable sending requests to the API. */
  enabled?: boolean;
  transform?: (schema: TEntity) => TTransformedEntity;
}

const useEntity = <TEntity extends Entity, TTransformedEntity extends Entity = TEntity>(
  path: EntityPath,
  entityFn: EntityFn<void>,
  opts: UseEntityOpts<TEntity, TTransformedEntity> = {},
) => {
  const [isFetching, setPromise] = useLoading(true);
  const [error, setError] = useState<unknown>();

  const dispatch = useAppDispatch();

  const [entityType, entityId] = path;

  const defaultSchema = v.custom<TEntity>(() => true);
  const schema = opts.schema || defaultSchema;

  const entity = useAppSelector(state => selectEntity<TTransformedEntity>(state, entityType, entityId));

  const isEnabled = opts.enabled ?? true;
  const isLoading = isFetching && !entity;
  const isLoaded = !isFetching && !!entity;

  const fetchEntity = async () => {
    try {
      const response = await setPromise(entityFn());
      let entity: TEntity | TTransformedEntity = v.parse(schema, response);
      if (opts.transform) entity = opts.transform(entity);
      dispatch(importEntities([entity], entityType));
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (!isEnabled || error) return;
    if (!entity || opts.refetch) {
      fetchEntity();
    }
  }, [isEnabled]);

  return {
    entity,
    fetchEntity,
    isFetching,
    isLoading,
    isLoaded,
    error,
    isUnauthorized: (error as { response?: PlfeResponse })?.response?.status === 401,
    isForbidden: (error as { response?: PlfeResponse })?.response?.status === 403,
  };
};

export {
  useEntity,
  type UseEntityOpts,
};
