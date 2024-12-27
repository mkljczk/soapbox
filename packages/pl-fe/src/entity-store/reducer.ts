import { create, type Immutable, type Draft } from 'mutative';

import {
  ENTITIES_IMPORT,
  ENTITIES_DELETE,
  ENTITIES_DISMISS,
  ENTITIES_FETCH_REQUEST,
  ENTITIES_FETCH_SUCCESS,
  ENTITIES_FETCH_FAIL,
  ENTITIES_INVALIDATE_LIST,
  ENTITIES_INCREMENT,
  ENTITIES_TRANSACTION,
  type EntityAction,
  type DeleteEntitiesOpts,
} from './actions';
import { Entities } from './entities';
import { createCache, createList, updateStore, updateList } from './utils';

import type { EntitiesTransaction, Entity, EntityCache, EntityListState, ImportPosition } from './types';

/** Entity reducer state. */
type State = Immutable<{
  [entityType: string]: EntityCache | undefined;
}>;

/** Import entities into the cache. */
const importEntities = (
  draft: Draft<State>,
  entityType: string,
  entities: Entity[],
  listKey?: string,
  pos?: ImportPosition,
  newState?: EntityListState,
  overwrite = false,
) => {
  const cache = draft[entityType] ?? createCache();
  cache.store = updateStore(cache.store, entities);

  if (typeof listKey === 'string') {
    let list = cache.lists[listKey] ?? createList();

    if (overwrite) {
      list.ids = new Set();
    }

    list = updateList(list, entities, pos);

    if (newState) {
      list.state = newState;
    }

    cache.lists[listKey] = list;
  }

  draft[entityType] = cache;

  if (entityType === Entities.GROUPS) {
    importEntities(
      draft,
      Entities.GROUP_RELATIONSHIPS,
      entities.map((entity: any) => entity?.relationship).filter((relationship: any) => relationship),
      listKey,
      pos,
    );
  }
};

const deleteEntities = (
  draft: Draft<State>,
  entityType: string,
  ids: Iterable<string>,
  opts: DeleteEntitiesOpts,
) => {
  const cache = draft[entityType] ?? createCache();

  for (const id of ids) {
    delete cache.store[id];

    if (!opts?.preserveLists) {
      for (const list of Object.values(cache.lists)) {
        if (list) {
          list.ids.delete(id);

          if (typeof list.state.totalCount === 'number') {
            list.state.totalCount--;
          }
        }
      }
    }
  }

  draft[entityType] = cache;
};

const dismissEntities = (
  draft: Draft<State>,
  entityType: string,
  ids: Iterable<string>,
  listKey: string,
) => {
  const cache = draft[entityType] ?? createCache();
  const list = cache.lists[listKey];

  if (list) {
    for (const id of ids) {
      list.ids.delete(id);

      if (typeof list.state.totalCount === 'number') {
        list.state.totalCount--;
      }
    }

    draft[entityType] = cache;
  }
};

const incrementEntities = (
  draft: Draft<State>,
  entityType: string,
  listKey: string,
  diff: number,
) => {
  const cache = draft[entityType] ?? createCache();
  const list = cache.lists[listKey];

  if (typeof list?.state?.totalCount === 'number') {
    list.state.totalCount += diff;
    draft[entityType] = cache;
  }
};

const setFetching = (
  draft: Draft<State>,
  entityType: string,
  listKey: string | undefined,
  isFetching: boolean,
  error?: any,
) => {
  const cache = draft[entityType] ?? createCache();

  if (typeof listKey === 'string') {
    const list = cache.lists[listKey] ?? createList();
    list.state.fetching = isFetching;
    list.state.error = error;
    cache.lists[listKey] = list;
  }

  draft[entityType] = cache;
};

const invalidateEntityList = (draft: Draft<State>, entityType: string, listKey: string) => {
  const cache = draft[entityType] ?? createCache();
  const list = cache.lists[listKey] ?? createList();
  list.state.invalid = true;
};

const doTransaction = (draft: Draft<State>, transaction: EntitiesTransaction) => {
  for (const [entityType, changes] of Object.entries(transaction)) {
    const cache = draft[entityType] ?? createCache();
    for (const [id, change] of Object.entries(changes)) {
      const entity = cache.store[id];
      if (entity) {
        cache.store[id] = change(entity);
      }
    }
  }
};

/** Stores various entity data and lists in a one reducer. */
const reducer = (state: Readonly<State> = {}, action: EntityAction): State => {
  switch (action.type) {
    case ENTITIES_IMPORT:
      return create(state, draft => importEntities(draft, action.entityType, action.entities, action.listKey, action.pos), { enableAutoFreeze: true });
    case ENTITIES_DELETE:
      return create(state, draft => deleteEntities(draft, action.entityType, action.ids, action.opts));
    case ENTITIES_DISMISS:
      return create(state, draft => dismissEntities(draft, action.entityType, action.ids, action.listKey));
    case ENTITIES_INCREMENT:
      return create(state, draft => incrementEntities(draft, action.entityType, action.listKey, action.diff));
    case ENTITIES_FETCH_SUCCESS:
      return create(state, draft => importEntities(draft, action.entityType, action.entities, action.listKey, action.pos, action.newState, action.overwrite), { enableAutoFreeze: true });
    case ENTITIES_FETCH_REQUEST:
      return create(state, draft => setFetching(draft, action.entityType, action.listKey, true));
    case ENTITIES_FETCH_FAIL:
      return create(state, draft => setFetching(draft, action.entityType, action.listKey, false, action.error));
    case ENTITIES_INVALIDATE_LIST:
      return create(state, draft => invalidateEntityList(draft, action.entityType, action.listKey));
    case ENTITIES_TRANSACTION:
      return create(state, draft => doTransaction(draft, action.transaction));
    default:
      return state;
  }
};

export { type State, reducer as default };
