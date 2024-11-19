import { AppDispatch, RootState } from 'pl-fe/store';

import { getClient } from '../api';

import { fetchRelationships } from './accounts';
import { importEntities } from './importer';

import type { Account } from 'pl-api';

const FAMILIAR_FOLLOWERS_FETCH_REQUEST = 'FAMILIAR_FOLLOWERS_FETCH_REQUEST' as const;
const FAMILIAR_FOLLOWERS_FETCH_SUCCESS = 'FAMILIAR_FOLLOWERS_FETCH_SUCCESS' as const;
const FAMILIAR_FOLLOWERS_FETCH_FAIL = 'FAMILIAR_FOLLOWERS_FETCH_FAIL' as const;

const fetchAccountFamiliarFollowers = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch<FamiliarFollowersAction>({
    type: FAMILIAR_FOLLOWERS_FETCH_REQUEST,
    accountId,
  });

  getClient(getState()).accounts.getFamiliarFollowers([accountId])
    .then((data) => {
      const accounts = data.find(({ id }: { id: string }) => id === accountId)!.accounts;

      dispatch(importEntities({ accounts }));
      dispatch(fetchRelationships(accounts.map((item) => item.id)));
      dispatch<FamiliarFollowersAction>({
        type: FAMILIAR_FOLLOWERS_FETCH_SUCCESS,
        accountId,
        accounts,
      });
    })
    .catch(error => dispatch<FamiliarFollowersAction>({
      type: FAMILIAR_FOLLOWERS_FETCH_FAIL,
      accountId,
      error,
      skipAlert: true,
    }));
};

type FamiliarFollowersAction =
  | {
    type: typeof FAMILIAR_FOLLOWERS_FETCH_REQUEST;
    accountId: string;
  }
  | {
    type: typeof FAMILIAR_FOLLOWERS_FETCH_SUCCESS;
    accountId: string;
    accounts: Array<Account>;
  }
  | {
    type: typeof FAMILIAR_FOLLOWERS_FETCH_FAIL;
    accountId: string;
    error: unknown;
    skipAlert: true;
  }

export {
  FAMILIAR_FOLLOWERS_FETCH_REQUEST,
  FAMILIAR_FOLLOWERS_FETCH_SUCCESS,
  FAMILIAR_FOLLOWERS_FETCH_FAIL,
  fetchAccountFamiliarFollowers,
  type FamiliarFollowersAction,
};
