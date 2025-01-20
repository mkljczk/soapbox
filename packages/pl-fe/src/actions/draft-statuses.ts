
import { makeGetAccount } from 'pl-fe/selectors';
import KVStore from 'pl-fe/storage/kv-store';

import type { AppDispatch, RootState } from 'pl-fe/store';
import type { APIEntity } from 'pl-fe/types/entities';

const DRAFT_STATUSES_FETCH_SUCCESS = 'DRAFT_STATUSES_FETCH_SUCCESS' as const;

const PERSIST_DRAFT_STATUS = 'PERSIST_DRAFT_STATUS' as const;
const CANCEL_DRAFT_STATUS = 'DELETE_DRAFT_STATUS' as const;

const getAccount = makeGetAccount();

interface DraftStatusesFetchSuccessAction {
  type: typeof DRAFT_STATUSES_FETCH_SUCCESS;
  statuses: Array<APIEntity>;
}

const fetchDraftStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = getAccount(state, state.me as string)!.url;

    return KVStore.getItem<Array<APIEntity>>(`drafts:${accountUrl}`).then((statuses) => {
      if (statuses) {
        dispatch<DraftStatusesFetchSuccessAction>({
          type: DRAFT_STATUSES_FETCH_SUCCESS,
          statuses,
        });
      }
    }).catch(() => {});
  };

interface PersistDraftStatusAction {
  type: typeof PERSIST_DRAFT_STATUS;
  status: Record<string, any>;
  accountUrl: string;
}

const saveDraftStatus = (composeId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = getAccount(state, state.me as string)!.url;

    const compose = state.compose[composeId]!;

    const draft = {
      ...compose,
      draft_id: compose.draft_id || crypto.randomUUID(),
    };

    dispatch<PersistDraftStatusAction>({
      type: PERSIST_DRAFT_STATUS,
      status: draft,
      accountUrl,
    });
  };

interface CancelDraftStatusAction {
  type: typeof CANCEL_DRAFT_STATUS;
  statusId: string;
  accountUrl: string;
}

const cancelDraftStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = getAccount(state, state.me as string)!.url;

    dispatch<CancelDraftStatusAction>({
      type: CANCEL_DRAFT_STATUS,
      statusId,
      accountUrl,
    });
  };

type DraftStatusesAction =
  | DraftStatusesFetchSuccessAction
  | PersistDraftStatusAction
  | CancelDraftStatusAction

export {
  DRAFT_STATUSES_FETCH_SUCCESS,
  PERSIST_DRAFT_STATUS,
  CANCEL_DRAFT_STATUS,
  fetchDraftStatuses,
  saveDraftStatus,
  cancelDraftStatus,
  type DraftStatusesAction,
};
