import type { EntitiesTransaction, Entity, EntityListState, ImportPosition } from './types';

const ENTITIES_IMPORT = 'ENTITIES_IMPORT' as const;
const ENTITIES_DELETE = 'ENTITIES_DELETE' as const;
const ENTITIES_DISMISS = 'ENTITIES_DISMISS' as const;
const ENTITIES_FETCH_REQUEST = 'ENTITIES_FETCH_REQUEST' as const;
const ENTITIES_FETCH_SUCCESS = 'ENTITIES_FETCH_SUCCESS' as const;
const ENTITIES_FETCH_FAIL = 'ENTITIES_FETCH_FAIL' as const;
const ENTITIES_INVALIDATE_LIST = 'ENTITIES_INVALIDATE_LIST' as const;
const ENTITIES_TRANSACTION = 'ENTITIES_TRANSACTION' as const;

/** Action to import entities into the cache. */
const importEntities = (
  entities: Entity[],
  entityType: string,
  listKey?: string,
  pos?: ImportPosition,
) => ({
  type: ENTITIES_IMPORT,
  entityType,
  entities,
  listKey,
  pos,
});

interface DeleteEntitiesOpts {
  preserveLists?: boolean;
}

const deleteEntities = (ids: Iterable<string>, entityType: string, opts: DeleteEntitiesOpts = {}) => ({
  type: ENTITIES_DELETE,
  ids,
  entityType,
  opts,
});

const dismissEntities = (ids: Iterable<string>, entityType: string, listKey: string) => ({
  type: ENTITIES_DISMISS,
  ids,
  entityType,
  listKey,
});

const entitiesFetchRequest = (entityType: string, listKey?: string) => ({
  type: ENTITIES_FETCH_REQUEST,
  entityType,
  listKey,
});

const entitiesFetchSuccess = (
  entities: Entity[],
  entityType: string,
  listKey?: string,
  pos?: ImportPosition,
  newState?: EntityListState,
  overwrite = false,
) => ({
  type: ENTITIES_FETCH_SUCCESS,
  entityType,
  entities,
  listKey,
  pos,
  newState,
  overwrite,
});

const entitiesFetchFail = (entityType: string, listKey: string | undefined, error: any) => ({
  type: ENTITIES_FETCH_FAIL,
  entityType,
  listKey,
  error,
});

const invalidateEntityList = (entityType: string, listKey: string) => ({
  type: ENTITIES_INVALIDATE_LIST,
  entityType,
  listKey,
});

const entitiesTransaction = (transaction: EntitiesTransaction) => ({
  type: ENTITIES_TRANSACTION,
  transaction,
});

/** Any action pertaining to entities. */
type EntityAction =
  ReturnType<typeof importEntities>
  | ReturnType<typeof deleteEntities>
  | ReturnType<typeof dismissEntities>
  | ReturnType<typeof entitiesFetchRequest>
  | ReturnType<typeof entitiesFetchSuccess>
  | ReturnType<typeof entitiesFetchFail>
  | ReturnType<typeof invalidateEntityList>
  | ReturnType<typeof entitiesTransaction>;

export {
  type DeleteEntitiesOpts,
  type EntityAction,
  ENTITIES_IMPORT,
  ENTITIES_DELETE,
  ENTITIES_DISMISS,
  ENTITIES_FETCH_REQUEST,
  ENTITIES_FETCH_SUCCESS,
  ENTITIES_FETCH_FAIL,
  ENTITIES_INVALIDATE_LIST,
  ENTITIES_TRANSACTION,
  importEntities,
  deleteEntities,
  dismissEntities,
  entitiesFetchRequest,
  entitiesFetchSuccess,
  entitiesFetchFail,
  invalidateEntityList,
  entitiesTransaction,
};
