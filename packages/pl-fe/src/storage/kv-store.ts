import localforage from 'localforage';

interface IKVStore extends LocalForage {
  getItemOrError: (key: string) => Promise<any>;
}

// localForage
// https://localforage.github.io/localForage/#settings-api-config
const KVStore = localforage.createInstance({
  name: 'pl-fe',
  description: 'pl-fe offline data store',
  driver: localforage.INDEXEDDB,
  storeName: 'keyvaluepairs',
}) as IKVStore;

// localForage returns 'null' when a key isn't found.
// In the Redux action flow, we want it to fail harder.
KVStore.getItemOrError = (key: string) => KVStore.getItem(key).then(value => {
  if (value === null) {
    throw new Error(`KVStore: null value for key ${key}`);
  } else {
    return value;
  }
});

export {
  KVStore as default,
};
