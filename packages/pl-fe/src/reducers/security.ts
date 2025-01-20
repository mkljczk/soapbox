import { create } from 'mutative';

import {
  MFA_FETCH_SUCCESS,
  MFA_CONFIRM_SUCCESS,
  MFA_DISABLE_SUCCESS,
  type MfaAction,
} from '../actions/mfa';
import { FETCH_TOKENS_SUCCESS, REVOKE_TOKEN_SUCCESS, type SecurityAction } from '../actions/security';

import type { OauthToken } from 'pl-api';

interface State {
  tokens: Array<OauthToken>;
  mfa: {
    settings: Record<string, boolean>;
  };
}

const initialState: State = {
  tokens: [],
  mfa: {
    settings: {
      totp: false,
    },
  },
};

const deleteToken = (state: State, tokenId: number) => state.tokens = state.tokens.filter(token => token.id !== tokenId);

const importMfa = (state: State, data: any) => state.mfa = data;

const enableMfa = (state: State, method: string) => state.mfa.settings = { ...state.mfa.settings, [method]: true };

const disableMfa = (state: State, method: string) => state.mfa.settings = { ...state.mfa.settings, [method]: false };

const security = (state = initialState, action: MfaAction | SecurityAction) => {
  switch (action.type) {
    case FETCH_TOKENS_SUCCESS:
      return create(state, (draft) => {
        draft.tokens = action.tokens;
      });
    case REVOKE_TOKEN_SUCCESS:
      return create(state, (draft) => {
        deleteToken(draft, action.tokenId);
      });
    case MFA_FETCH_SUCCESS:
      return create(state, (draft) => {
        importMfa(draft, action.data);
      });
    case MFA_CONFIRM_SUCCESS:
      return create(state, (draft) => {
        enableMfa(draft, action.method);
      });
    case MFA_DISABLE_SUCCESS:
      return create(state, (draft) => {
        disableMfa(draft, action.method);
      });
    default:
      return state;
  }
};

export { security as default };
