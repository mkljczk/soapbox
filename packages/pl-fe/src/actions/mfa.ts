import { getClient } from '../api';

import type { PlApiClient } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const MFA_FETCH_REQUEST = 'MFA_FETCH_REQUEST' as const;
const MFA_FETCH_SUCCESS = 'MFA_FETCH_SUCCESS' as const;
const MFA_FETCH_FAIL = 'MFA_FETCH_FAIL' as const;

const MFA_BACKUP_CODES_FETCH_REQUEST = 'MFA_BACKUP_CODES_FETCH_REQUEST' as const;
const MFA_BACKUP_CODES_FETCH_SUCCESS = 'MFA_BACKUP_CODES_FETCH_SUCCESS' as const;
const MFA_BACKUP_CODES_FETCH_FAIL = 'MFA_BACKUP_CODES_FETCH_FAIL' as const;

const MFA_SETUP_REQUEST = 'MFA_SETUP_REQUEST' as const;
const MFA_SETUP_SUCCESS = 'MFA_SETUP_SUCCESS' as const;
const MFA_SETUP_FAIL = 'MFA_SETUP_FAIL' as const;

const MFA_CONFIRM_REQUEST = 'MFA_CONFIRM_REQUEST' as const;
const MFA_CONFIRM_SUCCESS = 'MFA_CONFIRM_SUCCESS' as const;
const MFA_CONFIRM_FAIL = 'MFA_CONFIRM_FAIL' as const;

const MFA_DISABLE_REQUEST = 'MFA_DISABLE_REQUEST' as const;
const MFA_DISABLE_SUCCESS = 'MFA_DISABLE_SUCCESS' as const;
const MFA_DISABLE_FAIL = 'MFA_DISABLE_FAIL' as const;

const fetchMfa = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<MfaAction>({ type: MFA_FETCH_REQUEST });
    return getClient(getState).settings.mfa.getMfaSettings().then((data) => {
      dispatch<MfaAction>({ type: MFA_FETCH_SUCCESS, data });
    }).catch(() => {
      dispatch<MfaAction>({ type: MFA_FETCH_FAIL });
    });
  };

const fetchBackupCodes = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<MfaAction>({ type: MFA_BACKUP_CODES_FETCH_REQUEST });
    return getClient(getState).settings.mfa.getMfaBackupCodes().then((data) => {
      dispatch<MfaAction>({ type: MFA_BACKUP_CODES_FETCH_SUCCESS, data });
      return data;
    }).catch((error: unknown) => {
      dispatch<MfaAction>({ type: MFA_BACKUP_CODES_FETCH_FAIL });
      throw error;
    });
  };

const setupMfa = (method: 'totp') =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<MfaAction>({ type: MFA_SETUP_REQUEST, method });
    return getClient(getState).settings.mfa.getMfaSetup(method).then((data) => {
      dispatch<MfaAction>({ type: MFA_SETUP_SUCCESS, data });
      return data;
    }).catch((error: unknown) => {
      dispatch<MfaAction>({ type: MFA_SETUP_FAIL });
      throw error;
    });
  };

const confirmMfa = (method: 'totp', code: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<MfaAction>({ type: MFA_CONFIRM_REQUEST, method, code });
    return getClient(getState).settings.mfa.confirmMfaSetup(method, code, password).then((data) => {
      dispatch<MfaAction>({ type: MFA_CONFIRM_SUCCESS, method, code });
      return data;
    }).catch((error: unknown) => {
      dispatch<MfaAction>({ type: MFA_CONFIRM_FAIL, method, code, error, skipAlert: true });
      throw error;
    });
  };

const disableMfa = (method: 'totp', password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<MfaAction>({ type: MFA_DISABLE_REQUEST, method });
    return getClient(getState).settings.mfa.disableMfa(method, password).then((data) => {
      dispatch<MfaAction>({ type: MFA_DISABLE_SUCCESS, method });
      return data;
    }).catch((error: unknown) => {
      dispatch<MfaAction>({ type: MFA_DISABLE_FAIL, method, skipAlert: true });
      throw error;
    });
  };

type MfaAction =
  | { type: typeof MFA_FETCH_REQUEST }
  | { type: typeof MFA_FETCH_SUCCESS; data: Awaited<ReturnType<(InstanceType<typeof PlApiClient>)['settings']['mfa']['getMfaSettings']>> }
  | { type: typeof MFA_FETCH_FAIL }
  | { type: typeof MFA_BACKUP_CODES_FETCH_REQUEST }
  | { type: typeof MFA_BACKUP_CODES_FETCH_SUCCESS; data: Awaited<ReturnType<(InstanceType<typeof PlApiClient>)['settings']['mfa']['getMfaBackupCodes']>> }
  | { type: typeof MFA_BACKUP_CODES_FETCH_FAIL }
  | { type: typeof MFA_SETUP_REQUEST; method: 'totp' }
  | { type: typeof MFA_SETUP_SUCCESS; data: Awaited<ReturnType<(InstanceType<typeof PlApiClient>)['settings']['mfa']['getMfaSetup']>> }
  | { type: typeof MFA_SETUP_FAIL }
  | { type: typeof MFA_CONFIRM_REQUEST; method: 'totp'; code: string }
  | { type: typeof MFA_CONFIRM_SUCCESS; method: 'totp'; code: string }
  | { type: typeof MFA_CONFIRM_FAIL; method: 'totp'; code: string; error: unknown; skipAlert: true }
  | { type: typeof MFA_DISABLE_REQUEST; method: 'totp' }
  | { type: typeof MFA_DISABLE_SUCCESS; method: 'totp' }
  | { type: typeof MFA_DISABLE_FAIL; method: 'totp'; skipAlert: true };

export {
  MFA_FETCH_REQUEST,
  MFA_FETCH_SUCCESS,
  MFA_FETCH_FAIL,
  MFA_BACKUP_CODES_FETCH_REQUEST,
  MFA_BACKUP_CODES_FETCH_SUCCESS,
  MFA_BACKUP_CODES_FETCH_FAIL,
  MFA_SETUP_REQUEST,
  MFA_SETUP_SUCCESS,
  MFA_SETUP_FAIL,
  MFA_CONFIRM_REQUEST,
  MFA_CONFIRM_SUCCESS,
  MFA_CONFIRM_FAIL,
  MFA_DISABLE_REQUEST,
  MFA_DISABLE_SUCCESS,
  MFA_DISABLE_FAIL,
  fetchMfa,
  fetchBackupCodes,
  setupMfa,
  confirmMfa,
  disableMfa,
  type MfaAction,
};
