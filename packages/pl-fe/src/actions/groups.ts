import { getClient } from '../api';

import type { AppDispatch, RootState } from 'pl-fe/store';

const groupKick = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    return getClient(getState).experimental.groups.kickGroupUsers(groupId, [accountId]);
  };

export {
  groupKick,
};
