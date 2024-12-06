import type { Entity } from '../types';
import type { BaseSchema, BaseIssue } from 'valibot';

type EntitySchema<TEntity extends Entity = Entity> = BaseSchema<any, TEntity, BaseIssue<unknown>>;

/**
 * Tells us where to find/store the entity in the cache.
 * This value is accepted in hooks, but needs to be parsed into an `EntitiesPath`
 * before being passed to the store.
 */
type ExpandedEntitiesPath = [
  /** Name of the entity type for use in the global cache, eg `'Notification'`. */
  entityType: string,
  /**
   * Name of a particular index of this entity type.
   * Multiple params get combined into one string with a `:` separator.
   */
  ...listKeys: string[],
]

/** Used to look up an entity in a list. */
type EntitiesPath = [entityType: string, listKey: string]

/** Used to look up a single entity by its ID. */
type EntityPath = [entityType: string, entityId: string]

/** Callback functions for entity actions. */
interface EntityCallbacks<Value, Error = unknown> {
  onSuccess?(value: Value): void;
  onError?(error: Error): void;
}

/**
 * Passed into hooks to make requests.
 * Must return a response.
 */
type EntityFn<T> = (value: T) => Promise<any>;

export type {
  EntitySchema,
  ExpandedEntitiesPath,
  EntitiesPath,
  EntityPath,
  EntityCallbacks,
  EntityFn,
};
