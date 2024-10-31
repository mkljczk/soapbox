import { useEffect, useState } from 'react';
import * as v from 'valibot';

import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useLoading } from 'pl-fe/hooks/use-loading';

import { importEntities } from '../actions';
import { findEntity } from '../selectors';

import type { EntityFn } from './types';
import type { UseEntityOpts } from './use-entity';
import type { Entity } from '../types';
import type { PlfeResponse } from 'pl-fe/api';

/** Entities will be filtered through this function until it returns true. */
type LookupFn<TEntity extends Entity> = (entity: TEntity) => boolean

const useEntityLookup = <TEntity extends Entity, TTransformedEntity extends Entity = TEntity>(
  entityType: string,
  lookupFn: LookupFn<TTransformedEntity>,
  entityFn: EntityFn<void>,
  opts: UseEntityOpts<TEntity, TTransformedEntity> = {},
) => {
  const { schema = v.custom<TEntity>(() => true) } = opts;

  const dispatch = useAppDispatch();
  const [fetchedEntity, setFetchedEntity] = useState<TTransformedEntity | undefined>();
  const [isFetching, setPromise] = useLoading(true);
  const [error, setError] = useState<unknown>();

  const entity = useAppSelector(state => findEntity(state, entityType, lookupFn) ?? fetchedEntity);
  const isEnabled = opts.enabled ?? true;
  const isLoading = isFetching && !entity;

  const fetchEntity = async () => {
    try {
      const response = await setPromise(entityFn());
      const entity = v.parse(schema, response);
      const transformedEntity = opts.transform ? opts.transform(entity) : entity;
      setFetchedEntity(transformedEntity as TTransformedEntity);
      dispatch(importEntities([transformedEntity], entityType));
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (!isEnabled) return;

    if (!entity || opts.refetch) {
      fetchEntity();
    }
  }, [isEnabled]);

  return {
    entity,
    fetchEntity,
    isFetching,
    isLoading,
    isUnauthorized: (error as { response?: PlfeResponse })?.response?.status === 401,
    isForbidden: (error as { response?: PlfeResponse })?.response?.status === 403,
  };
};

export { useEntityLookup };
