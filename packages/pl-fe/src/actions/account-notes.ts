import { getClient } from 'pl-fe/api';
import { importEntities } from 'pl-hooks';

import type { AppDispatch, RootState } from 'pl-fe/store';

const submitAccountNote = (accountId: string, value: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).accounts.updateAccountNote(accountId, value)
      .then(response => importEntities({ relationships: [response] }));

export { submitAccountNote };
