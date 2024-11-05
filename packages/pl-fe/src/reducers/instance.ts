import { Map as ImmutableMap } from 'immutable';
import { create } from 'mutative';
import { type Instance, instanceSchema, PleromaConfig } from 'pl-api';
import * as v from 'valibot';

import { ADMIN_CONFIG_UPDATE_REQUEST, ADMIN_CONFIG_UPDATE_SUCCESS } from 'pl-fe/actions/admin';
import { INSTANCE_FETCH_FAIL, INSTANCE_FETCH_SUCCESS, InstanceAction } from 'pl-fe/actions/instance';
import { PLEROMA_PRELOAD_IMPORT, type PreloadAction } from 'pl-fe/actions/preload';
import KVStore from 'pl-fe/storage/kv-store';
import ConfigDB from 'pl-fe/utils/config-db';

import type { AnyAction } from 'redux';

const initialState: State = v.parse(instanceSchema, {});

type State = Instance;

const preloadImport = (state: State, action: Record<string, any>, path: string) => {
  const instance = action.data[path];
  return instance ? v.parse(instanceSchema, instance) : state;
};

const getConfigValue = (instanceConfig: ImmutableMap<string, any>, key: string) => {
  const v = instanceConfig
    .find(value => value.getIn(['tuple', 0]) === key);

  return v ? v.getIn(['tuple', 1]) : undefined;
};

const importConfigs = (state: State, configs: PleromaConfig['configs']) => {
  // FIXME: This is pretty hacked together. Need to make a cleaner map.
  const config = ConfigDB.find(configs, ':pleroma', ':instance');
  const simplePolicy = ConfigDB.toSimplePolicy(configs);

  if (!config && !simplePolicy) return state;

  if (config) {
    const value = config.value || [];
    const registrationsOpen = getConfigValue(value, ':registrations_open') as boolean | undefined;
    const approvalRequired = getConfigValue(value, ':account_approval_required') as boolean | undefined;

    state.registrations = {
      enabled: registrationsOpen ?? state.registrations.enabled,
      approval_required: approvalRequired ?? state.registrations.approval_required,
    };
  }

  if (simplePolicy) {
    state.pleroma.metadata.federation.mrf_simple = simplePolicy;
  }
};

const handleAuthFetch = (state: State) => {
  // Authenticated fetch is enabled, so make the instance appear censored
  return {
    ...state,
    title: state.title || '██████',
    description: state.description || '████████████',
  };
};

const getHost = (instance: { domain: string }) => {
  const domain = instance.domain;
  try {
    return new URL(domain).host;
  } catch {
    try {
      return new URL(`https://${domain}`).host;
    } catch {
      return null;
    }
  }
};

const persistInstance = (instance: { domain: string }, host: string | null = getHost(instance)) => {
  if (host) {
    KVStore.setItem(`instance:${host}`, instance).catch(console.error);
  }
};

const handleInstanceFetchFail = (state: State, error: Record<string, any>) => {
  if (error.response?.status === 401) {
    return handleAuthFetch(state);
  } else {
    return state;
  }
};

const instance = (state = initialState, action: AnyAction | InstanceAction | PreloadAction): State => {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return create(state, (draft) => preloadImport(draft, action, '/api/v1/instance'));
    case INSTANCE_FETCH_SUCCESS:
      persistInstance(action.instance);
      return action.instance;
    case INSTANCE_FETCH_FAIL:
      return handleInstanceFetchFail(state, action.error);
    case ADMIN_CONFIG_UPDATE_REQUEST:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return create(state, (draft) => importConfigs(draft, action.configs));
    default:
      return state;
  }
};
export { instance as default };
