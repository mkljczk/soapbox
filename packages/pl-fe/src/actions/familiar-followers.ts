import { importEntities } from 'pl-hooks';

import { getClient } from 'pl-fe/api';
import { AppDispatch, RootState } from 'pl-fe/store';

import { fetchRelationships } from './accounts';

const FAMILIAR_FOLLOWERS_FETCH_REQUEST = 'FAMILIAR_FOLLOWERS_FETCH_REQUEST' as const;
const FAMILIAR_FOLLOWERS_FETCH_SUCCESS = 'FAMILIAR_FOLLOWERS_FETCH_SUCCESS' as const;
const FAMILIAR_FOLLOWERS_FETCH_FAIL = 'FAMILIAR_FOLLOWERS_FETCH_FAIL' as const;

const fetchAccountFamiliarFollowers = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({
    type: FAMILIAR_FOLLOWERS_FETCH_REQUEST,
    accountId,
  });

  getClient(getState()).accounts.getFamiliarFollowers([accountId])
    .then((data) => {
      const accounts = data.find(({ id }: { id: string }) => id === accountId)!.accounts;

      importEntities({ accounts });
      dispatch(fetchRelationships(accounts.map((item) => item.id)));
      dispatch({
        type: FAMILIAR_FOLLOWERS_FETCH_SUCCESS,
        accountId,
        accounts,
      });
    })
    .catch(error => dispatch({
      type: FAMILIAR_FOLLOWERS_FETCH_FAIL,
      accountId,
      error,
      skipAlert: true,
    }));
};

export {
  FAMILIAR_FOLLOWERS_FETCH_REQUEST,
  FAMILIAR_FOLLOWERS_FETCH_SUCCESS,
  FAMILIAR_FOLLOWERS_FETCH_FAIL,
  fetchAccountFamiliarFollowers,
};
