import { entitiesTransaction } from 'pl-fe/entity-store/actions';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

import type { EntityTypes } from 'pl-fe/entity-store/entities';
import type { EntitiesTransaction, Entity } from 'pl-fe/entity-store/types';

type Updater<TEntity extends Entity> = Record<string, (entity: TEntity) => TEntity>

type Changes = Partial<{
  [K in keyof EntityTypes]: Updater<EntityTypes[K]>
}>

const useTransaction = () => {
  const dispatch = useAppDispatch();

  const transaction = (changes: Changes): void => {
    dispatch(entitiesTransaction(changes as EntitiesTransaction));
  };

  return { transaction };
};

export { useTransaction };
