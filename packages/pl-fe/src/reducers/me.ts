import {
  AUTH_LOGGED_OUT,
  AUTH_ACCOUNT_REMEMBER_SUCCESS,
  VERIFY_CREDENTIALS_SUCCESS,
  type AuthAction,
} from '../actions/auth';
import {
  ME_FETCH_SUCCESS,
  ME_FETCH_FAIL,
  ME_FETCH_SKIP,
  ME_PATCH_SUCCESS,
  type MeAction,
} from '../actions/me';

import type { PlfeResponse } from 'pl-fe/api';
import type { Me } from 'pl-fe/types/pl-fe';

const initialState: Me = null;

const handleForbidden = (state: Me, error: { response: PlfeResponse }) => {
  if (([401, 403] as any[]).includes(error.response?.status)) {
    return false;
  } else {
    return state;
  }
};

const me = (state: Me = initialState, action: AuthAction | MeAction): Me => {
  switch (action.type) {
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return action.me.id;
    case VERIFY_CREDENTIALS_SUCCESS:
    case AUTH_ACCOUNT_REMEMBER_SUCCESS:
      return state || action.account.id;
    case ME_FETCH_SKIP:
    case AUTH_LOGGED_OUT:
      return false;
    case ME_FETCH_FAIL:
      return handleForbidden(state, action.error as any);
    default:
      return state;
  }
};

export { me as default };
