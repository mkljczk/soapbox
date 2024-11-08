import { importEntities } from 'pl-fe/actions/importer';

import { getClient } from '../api';

import type { AppDispatch, RootState } from 'pl-fe/store';

const submitAccountNote = (accountId: string, value: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).accounts.updateAccountNote(accountId, value)
      .then(response => dispatch(importEntities({ relationships: [response] })));

export { submitAccountNote };
