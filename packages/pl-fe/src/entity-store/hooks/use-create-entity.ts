import * as v from 'valibot';

import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useLoading } from 'pl-fe/hooks/use-loading';

import { importEntities } from '../actions';

import { parseEntitiesPath } from './utils';

import type { EntityCallbacks, EntityFn, EntitySchema, ExpandedEntitiesPath } from './types';
import type { Entity } from '../types';
import type { PlfeResponse } from 'pl-fe/api';

interface UseCreateEntityOpts<TEntity extends Entity = Entity, TTransformedEntity extends Entity = TEntity> {
  schema?: EntitySchema<TEntity>;
  transform?: (schema: TEntity) => TTransformedEntity;
}

const useCreateEntity = <TEntity extends Entity = Entity, TTransformedEntity extends Entity = TEntity, Data = unknown>(
  expandedPath: ExpandedEntitiesPath,
  entityFn: EntityFn<Data>,
  opts: UseCreateEntityOpts<TEntity, TTransformedEntity> = {},
) => {
  const dispatch = useAppDispatch();

  const [isSubmitting, setPromise] = useLoading();
  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  const createEntity = async (
    data: Data,
    callbacks: EntityCallbacks<TTransformedEntity, { response?: PlfeResponse }> = {},
  ): Promise<void> => {
    const result = await setPromise(entityFn(data));
    const schema = opts.schema || v.custom<TEntity>(() => true);
    let entity: TEntity | TTransformedEntity = v.parse(schema, result);
    if (opts.transform) entity = opts.transform(entity);

    // TODO: optimistic updating
    dispatch(importEntities([entity], entityType, listKey, 'start'));

    if (callbacks.onSuccess) {
      callbacks.onSuccess(entity as TTransformedEntity);
    }
  };

  return {
    createEntity,
    isSubmitting,
  };
};

export { useCreateEntity };
