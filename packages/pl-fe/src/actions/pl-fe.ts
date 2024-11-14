import { createSelector } from 'reselect';
import * as v from 'valibot';

import { getHost } from 'pl-fe/actions/instance';
import { plFeConfigSchema } from 'pl-fe/normalizers/pl-fe/pl-fe-config';
import KVStore from 'pl-fe/storage/kv-store';
import { useSettingsStore } from 'pl-fe/stores/settings';

import { getClient, staticFetch } from '../api';

import type { AppDispatch, RootState } from 'pl-fe/store';
import type { APIEntity } from 'pl-fe/types/entities';

const PLFE_CONFIG_REQUEST_SUCCESS = 'PLFE_CONFIG_REQUEST_SUCCESS' as const;
const PLFE_CONFIG_REQUEST_FAIL = 'PLFE_CONFIG_REQUEST_FAIL' as const;

const PLFE_CONFIG_REMEMBER_SUCCESS = 'PLFE_CONFIG_REMEMBER_SUCCESS' as const;

const getPlFeConfig = createSelector([
  (state: RootState) => state.plfe,
// Do some additional normalization with the state
], (plfe) => v.parse(plFeConfigSchema, plfe));

const rememberPlFeConfig = (host: string | null) =>
  (dispatch: AppDispatch) => {
    return KVStore.getItemOrError(`plfe_config:${host}`).then(plFeConfig => {
      dispatch({ type: PLFE_CONFIG_REMEMBER_SUCCESS, host, plFeConfig });
      return plFeConfig;
    }).catch(() => {});
  };

const fetchFrontendConfigurations = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).instance.getFrontendConfigurations();

/** Conditionally fetches pl-fe config depending on backend features */
const fetchPlFeConfig = (host: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const features = getState().auth.client.features;

    if (features.frontendConfigurations) {
      return dispatch(fetchFrontendConfigurations()).then(data => {
        if (data.pl_fe) {
          dispatch(importPlFeConfig(data.pl_fe, host));
          return data.pl_fe;
        } else {
          return dispatch(fetchPlFeJson(host));
        }
      });
    } else {
      return dispatch(fetchPlFeJson(host));
    }
  };

/** Tries to remember the config from browser storage before fetching it */
const loadPlFeConfig = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const host = getHost(getState());

    return dispatch(rememberPlFeConfig(host)).then(() =>
      dispatch(fetchPlFeConfig(host)),
    );
  };

const fetchPlFeJson = (host: string | null) =>
  (dispatch: AppDispatch) =>
    staticFetch('/instance/pl-fe.json').then(({ json: data }) => {
      if (!isObject(data)) throw 'pl-fe.json failed';
      dispatch(importPlFeConfig(data, host));
      return data;
    }).catch(error => {
      dispatch(plFeConfigFail(error, host));
    });

const importPlFeConfig = (plFeConfig: APIEntity, host: string | null) => {
  if (!plFeConfig.brandColor) {
    plFeConfig.brandColor = '#d80482';
  }

  useSettingsStore.getState().loadDefaultSettings(plFeConfig?.defaultSettings);

  return {
    type: PLFE_CONFIG_REQUEST_SUCCESS,
    plFeConfig,
    host,
  };
};

const plFeConfigFail = (error: unknown, host: string | null) => ({
  type: PLFE_CONFIG_REQUEST_FAIL,
  error,
  skipAlert: true,
  host,
});

// https://stackoverflow.com/a/46663081
const isObject = (o: any) => o instanceof Object && o.constructor === Object;

export {
  PLFE_CONFIG_REQUEST_SUCCESS,
  PLFE_CONFIG_REQUEST_FAIL,
  PLFE_CONFIG_REMEMBER_SUCCESS,
  getPlFeConfig,
  rememberPlFeConfig,
  fetchFrontendConfigurations,
  fetchPlFeConfig,
  loadPlFeConfig,
  fetchPlFeJson,
  importPlFeConfig,
  plFeConfigFail,
};
