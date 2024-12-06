import { getClient } from '../api';

import type { PlApiClient } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const MFA_FETCH_SUCCESS = 'MFA_FETCH_SUCCESS' as const;

const MFA_CONFIRM_SUCCESS = 'MFA_CONFIRM_SUCCESS' as const;

const MFA_DISABLE_SUCCESS = 'MFA_DISABLE_SUCCESS' as const;

const fetchMfa = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.mfa.getMfaSettings().then((data) => {
      dispatch<MfaAction>({ type: MFA_FETCH_SUCCESS, data });
    });

const fetchBackupCodes = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.mfa.getMfaBackupCodes();

const setupMfa = (method: 'totp') =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.mfa.getMfaSetup(method);

const confirmMfa = (method: 'totp', code: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.mfa.confirmMfaSetup(method, code, password).then((data) => {
      dispatch<MfaAction>({ type: MFA_CONFIRM_SUCCESS, method, code });
      return data;
    });

const disableMfa = (method: 'totp', password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.mfa.disableMfa(method, password).then((data) => {
      dispatch<MfaAction>({ type: MFA_DISABLE_SUCCESS, method });
      return data;
    });

type MfaAction =
  | { type: typeof MFA_FETCH_SUCCESS; data: Awaited<ReturnType<(InstanceType<typeof PlApiClient>)['settings']['mfa']['getMfaSettings']>> }
  | { type: typeof MFA_CONFIRM_SUCCESS; method: 'totp'; code: string }
  | { type: typeof MFA_DISABLE_SUCCESS; method: 'totp' }

export {
  MFA_FETCH_SUCCESS,
  MFA_CONFIRM_SUCCESS,
  MFA_DISABLE_SUCCESS,
  fetchMfa,
  fetchBackupCodes,
  setupMfa,
  confirmMfa,
  disableMfa,
  type MfaAction,
};
