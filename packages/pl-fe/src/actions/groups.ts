import { importEntities } from 'pl-hooks';

import { getClient } from 'pl-fe/api';

import type { Account, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const GROUP_BLOCKS_FETCH_REQUEST = 'GROUP_BLOCKS_FETCH_REQUEST' as const;
const GROUP_BLOCKS_FETCH_SUCCESS = 'GROUP_BLOCKS_FETCH_SUCCESS' as const;
const GROUP_BLOCKS_FETCH_FAIL = 'GROUP_BLOCKS_FETCH_FAIL' as const;

const GROUP_UNBLOCK_REQUEST = 'GROUP_UNBLOCK_REQUEST' as const;
const GROUP_UNBLOCK_SUCCESS = 'GROUP_UNBLOCK_SUCCESS' as const;
const GROUP_UNBLOCK_FAIL = 'GROUP_UNBLOCK_FAIL' as const;

const groupKick = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    return getClient(getState).experimental.groups.kickGroupUsers(groupId, [accountId]);
  };

const fetchGroupBlocks = (groupId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchGroupBlocksRequest(groupId));

    return getClient(getState).experimental.groups.getGroupBlocks(groupId).then(response => {
      importEntities({ accounts: response.items });
      dispatch(fetchGroupBlocksSuccess(groupId, response.items, response.next));
    }).catch(error => {
      dispatch(fetchGroupBlocksFail(groupId, error));
    });
  };

const fetchGroupBlocksRequest = (groupId: string) => ({
  type: GROUP_BLOCKS_FETCH_REQUEST,
  groupId,
});

const fetchGroupBlocksSuccess = (groupId: string, accounts: Array<Account>, next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: GROUP_BLOCKS_FETCH_SUCCESS,
  groupId,
  accounts,
  next,
});

const fetchGroupBlocksFail = (groupId: string, error: unknown) => ({
  type: GROUP_BLOCKS_FETCH_FAIL,
  groupId,
  error,
  skipNotFound: true,
});

const groupUnblock = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(groupUnblockRequest(groupId, accountId));

    return getClient(getState).experimental.groups.unblockGroupUsers(groupId, [accountId])
      .then(() => dispatch(groupUnblockSuccess(groupId, accountId)))
      .catch(err => dispatch(groupUnblockFail(groupId, accountId, err)));
  };

const groupUnblockRequest = (groupId: string, accountId: string) => ({
  type: GROUP_UNBLOCK_REQUEST,
  groupId,
  accountId,
});

const groupUnblockSuccess = (groupId: string, accountId: string) => ({
  type: GROUP_UNBLOCK_SUCCESS,
  groupId,
  accountId,
});

const groupUnblockFail = (groupId: string, accountId: string, error: unknown) => ({
  type: GROUP_UNBLOCK_FAIL,
  groupId,
  accountId,
  error,
});

export {
  GROUP_BLOCKS_FETCH_REQUEST,
  GROUP_BLOCKS_FETCH_SUCCESS,
  GROUP_BLOCKS_FETCH_FAIL,
  GROUP_UNBLOCK_REQUEST,
  GROUP_UNBLOCK_SUCCESS,
  GROUP_UNBLOCK_FAIL,
  groupKick,
  fetchGroupBlocks,
  fetchGroupBlocksRequest,
  fetchGroupBlocksSuccess,
  fetchGroupBlocksFail,
  groupUnblock,
  groupUnblockRequest,
  groupUnblockSuccess,
  groupUnblockFail,
};
