import { getAuthUserUrl, getMeUrl } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import type { Instance } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const INSTANCE_FETCH_SUCCESS = 'INSTANCE_FETCH_SUCCESS' as const;
const INSTANCE_FETCH_FAIL = 'INSTANCE_FETCH_FAIL' as const;

/** Figure out the appropriate instance to fetch depending on the state */
const getHost = (state: RootState) => {
  const accountUrl = getMeUrl(state) || getAuthUserUrl(state) as string;

  try {
    return new URL(accountUrl).host;
  } catch {
    return null;
  }
};

interface InstanceFetchSuccessAction {
  type: typeof INSTANCE_FETCH_SUCCESS;
  instance: Instance;
}

interface InstanceFetchFailAction {
  type: typeof INSTANCE_FETCH_FAIL;
  error: unknown;
}

const fetchInstance = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const instance = await getClient(getState).instance.getInstance();

    dispatch<InstanceFetchSuccessAction>({ type: INSTANCE_FETCH_SUCCESS, instance });
  } catch (error) {
    dispatch({ type: INSTANCE_FETCH_FAIL, error });
  }
};

type InstanceAction =
  InstanceFetchSuccessAction
  | InstanceFetchFailAction

export {
  INSTANCE_FETCH_SUCCESS,
  INSTANCE_FETCH_FAIL,
  getHost,
  fetchInstance,
  type InstanceAction,
};
