/**
 * Accounts Meta: private user data only the owner should see.
 * @module pl-fe/reducers/accounts_meta
 */
import { create, type Immutable } from 'mutative';

import { VERIFY_CREDENTIALS_SUCCESS, AUTH_ACCOUNT_REMEMBER_SUCCESS, type AuthAction } from 'pl-fe/actions/auth';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS, type MeAction } from 'pl-fe/actions/me';

import type { Account, CredentialAccount } from 'pl-api';

interface AccountMeta {
  pleroma: Account['__meta']['pleroma'];
  source: Account['__meta']['source'];
}

type State = Immutable<Record<string, AccountMeta | undefined>>;

const importAccount = (state: State, account: CredentialAccount): State =>
  create(state, draft => {
    const existing = draft[account.id];

    draft[account.id] = {
      pleroma: account.__meta.pleroma ?? existing?.pleroma,
      source: account.__meta.source ?? existing?.source,
    };
  }, { enableAutoFreeze: true });

const accounts_meta = (state: Readonly<State> = {}, action: AuthAction | MeAction): State => {
  switch (action.type) {
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return importAccount(state, action.me);
    case VERIFY_CREDENTIALS_SUCCESS:
    case AUTH_ACCOUNT_REMEMBER_SUCCESS:
      return importAccount(state, action.account);
    default:
      return state;
  }
};

export { accounts_meta as default };
