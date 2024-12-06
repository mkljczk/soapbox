import { PLEROMA_PRELOAD_IMPORT } from 'pl-fe/actions/preload';
import KVStore from 'pl-fe/storage/kv-store';
import ConfigDB from 'pl-fe/utils/config-db';

import { ADMIN_CONFIG_UPDATE_SUCCESS } from '../actions/admin';
import {
  PLFE_CONFIG_REMEMBER_SUCCESS,
  PLFE_CONFIG_REQUEST_SUCCESS,
  PLFE_CONFIG_REQUEST_FAIL,
} from '../actions/pl-fe';

import type { PleromaConfig } from 'pl-api';
import type { PlFeConfig } from 'pl-fe/normalizers/pl-fe/pl-fe-config';

const initialState: Partial<PlFeConfig> = {};

const fallbackState: Partial<PlFeConfig> = {
  brandColor: '#d80482',
};

const updateFromAdmin = (state: Record<string, any>, configs: PleromaConfig['configs']) => {
  try {
    return ConfigDB.find(configs, ':pleroma', ':frontend_configurations')!
      .value
      .find((value: Record<string, any>) => value.tuple?.[0] === ':pl_fe')
      .tuple?.[1];
  } catch {
    return state;
  }
};

const preloadImport = (state: Record<string, any>, action: Record<string, any>) => {
  const path = '/api/pleroma/frontend_configurations';
  const feData = action.data[path];

  if (feData) {
    const plfe = feData.pl_fe;
    return plfe ? { ...fallbackState, ...plfe } : fallbackState;
  } else {
    return state;
  }
};

const persistPlFeConfig = (plFeConfig: Record<string, any>, host: string) => {
  if (host) {
    KVStore.setItem(`plfe_config:${host}`, plFeConfig).catch(console.error);
  }
};

const importPlFeConfig = (plFeConfig: PlFeConfig, host: string) => {
  persistPlFeConfig(plFeConfig, host);
  return plFeConfig;
};

const plfe = (state = initialState, action: Record<string, any>): Partial<PlFeConfig> => {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return preloadImport(state, action);
    case PLFE_CONFIG_REMEMBER_SUCCESS:
      return action.plFeConfig;
    case PLFE_CONFIG_REQUEST_SUCCESS:
      return importPlFeConfig(action.plFeConfig || {}, action.host);
    case PLFE_CONFIG_REQUEST_FAIL:
      return { ...fallbackState, ...state };
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return updateFromAdmin(state, action.configs || []);
    default:
      return state;
  }
};

export { plfe as default };
