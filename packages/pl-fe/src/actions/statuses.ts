import { queryClient } from 'pl-fe/queries/client';
import { scheduledStatusesQueryOptions } from 'pl-fe/queries/statuses/scheduled-statuses';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';
import { useModalsStore } from 'pl-fe/stores/modals';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { shouldHaveCard } from 'pl-fe/utils/status';

import { getClient } from '../api';

import { setComposeToStatus } from './compose';
import { importEntities } from './importer';
import { deleteFromTimelines } from './timelines';

import type { CreateStatusParams, Status as BaseStatus, ScheduledStatus } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';
import type { IntlShape } from 'react-intl';

const STATUS_CREATE_REQUEST = 'STATUS_CREATE_REQUEST' as const;
const STATUS_CREATE_SUCCESS = 'STATUS_CREATE_SUCCESS' as const;
const STATUS_CREATE_FAIL = 'STATUS_CREATE_FAIL' as const;

const STATUS_FETCH_SOURCE_REQUEST = 'STATUS_FETCH_SOURCE_REQUEST' as const;
const STATUS_FETCH_SOURCE_SUCCESS = 'STATUS_FETCH_SOURCE_SUCCESS' as const;
const STATUS_FETCH_SOURCE_FAIL = 'STATUS_FETCH_SOURCE_FAIL' as const;

const CONTEXT_FETCH_SUCCESS = 'CONTEXT_FETCH_SUCCESS' as const;

const createStatus = (params: CreateStatusParams, idempotencyKey: string, statusId: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<StatusesAction>({ type: STATUS_CREATE_REQUEST, params, idempotencyKey, editing: !!statusId });

    return (statusId === null ? getClient(getState()).statuses.createStatus(params) : getClient(getState()).statuses.editStatus(statusId, params))
      .then((status) => {
        // The backend might still be processing the rich media attachment
        const expectsCard = status.scheduled_at === null && !status.card && shouldHaveCard(status);

        if (status.scheduled_at === null) dispatch(importEntities({ statuses: [{ ...status, expectsCard }] }, { idempotencyKey, withParents: true }));
        else queryClient.invalidateQueries(scheduledStatusesQueryOptions);
        dispatch<StatusesAction>({ type: STATUS_CREATE_SUCCESS, status, params, idempotencyKey, editing: !!statusId });

        // Poll the backend for the updated card
        if (expectsCard) {
          const delay = 1000;

          const poll = (retries = 5) => {
            return getClient(getState()).statuses.getStatus(status.id).then(response => {
              if (response.card) {
                dispatch(importEntities({ statuses: [response] }));
              } else if (retries > 0 && response) {
                setTimeout(() => poll(retries - 1), delay);
              }
            }).catch(console.error);
          };

          setTimeout(() => poll(), delay);
        }

        return status;
      }).catch(error => {
        dispatch<StatusesAction>({ type: STATUS_CREATE_FAIL, error, params, idempotencyKey, editing: !!statusId });
        throw error;
      });
  };

const editStatus = (statusId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();

  const status = queryClient.getQueryData(statusQueryOptions(statusId).queryKey)!;
  const poll = status.poll_id ? state.polls[status.poll_id] : undefined;

  dispatch<StatusesAction>({ type: STATUS_FETCH_SOURCE_REQUEST });

  return getClient(state).statuses.getStatusSource(statusId).then(response => {
    dispatch<StatusesAction>({ type: STATUS_FETCH_SOURCE_SUCCESS });
    dispatch(setComposeToStatus(status, poll, response.text, response.spoiler_text, response.content_type, false));
    useModalsStore.getState().openModal('COMPOSE');
  }).catch(error => {
    dispatch<StatusesAction>({ type: STATUS_FETCH_SOURCE_FAIL, error });
  });
};

const fetchStatus = (statusId: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const params = intl && useSettingsStore.getState().settings.autoTranslate ? {
      language: intl.locale,
    } : undefined;

    return getClient(getState()).statuses.getStatus(statusId, params).then(status => {
      dispatch(importEntities({ statuses: [status] }));
      return status;
    });
  };

const updateStatus = (status: BaseStatus) => (dispatch: AppDispatch) =>
  dispatch(importEntities({ statuses: [status] }));

const fetchContext = (statusId: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const params = intl && useSettingsStore.getState().settings.autoTranslate ? {
      language: intl.locale,
    } : undefined;

    return getClient(getState()).statuses.getContext(statusId, params).then(context => {
      const { ancestors, descendants } = context;
      const statuses = ancestors.concat(descendants);
      dispatch(importEntities({ statuses }));
      dispatch<StatusesAction>({ type: CONTEXT_FETCH_SUCCESS, statusId, ancestors, descendants });
      return context;
    }).catch(error => {
      if (error.response?.status === 404) {
        dispatch(deleteFromTimelines(statusId));
      }
    });
  };

// let TRANSLATIONS_QUEUE: Set<string> = new Set();
// let TRANSLATIONS_TIMEOUT: NodeJS.Timeout | null = null;

// const translateStatus = (statusId: string, targetLanguage: string, lazy?: boolean) =>
//   (dispatch: AppDispatch, getState: () => RootState) => {
//     const client = getClient(getState);
//     const features = client.features;

//     const handleTranslateMany = () => {
//       const copy = [...TRANSLATIONS_QUEUE];
//       TRANSLATIONS_QUEUE = new Set();
//       if (TRANSLATIONS_TIMEOUT) clearTimeout(TRANSLATIONS_TIMEOUT);

//       return client.statuses.translateStatuses(copy, targetLanguage).then((response) => {
//         response.forEach((translation) => {
//           dispatch<StatusesAction>({
//             type: STATUS_TRANSLATE_SUCCESS,
//             statusId: translation.id,
//             translation: translation,
//           });

//           copy
//             .filter((statusId) => !response.some(({ id }) => id === statusId))
//             .forEach((statusId) => dispatch<StatusesAction>({
//               type: STATUS_TRANSLATE_FAIL,
//               statusId,
//             }));
//         });
//       }).catch(error => {
//         dispatch<StatusesAction>({
//           type: STATUS_TRANSLATE_FAIL,
//           statusId,
//           error,
//         });
//       });
//     };

//     if (features.lazyTranslations && lazy) {
//       TRANSLATIONS_QUEUE.add(statusId);

//       if (TRANSLATIONS_TIMEOUT) clearTimeout(TRANSLATIONS_TIMEOUT);
//       TRANSLATIONS_TIMEOUT = setTimeout(() => handleTranslateMany(), 3000);
//     } else if (features.lazyTranslations && TRANSLATIONS_QUEUE.size) {
//       TRANSLATIONS_QUEUE.add(statusId);

//       handleTranslateMany();
//     }
//   };

type StatusesAction =
  | { type: typeof STATUS_CREATE_REQUEST; params: CreateStatusParams; idempotencyKey: string; editing: boolean }
  | { type: typeof STATUS_CREATE_SUCCESS; status: BaseStatus | ScheduledStatus; params: CreateStatusParams; idempotencyKey: string; editing: boolean }
  | { type: typeof STATUS_CREATE_FAIL; error: unknown; params: CreateStatusParams; idempotencyKey: string; editing: boolean }
  | { type: typeof STATUS_FETCH_SOURCE_REQUEST }
  | { type: typeof STATUS_FETCH_SOURCE_SUCCESS }
  | { type: typeof STATUS_FETCH_SOURCE_FAIL; error: unknown }
  | { type: typeof CONTEXT_FETCH_SUCCESS; statusId: string; ancestors: Array<BaseStatus>; descendants: Array<BaseStatus> };

export {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
  STATUS_CREATE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
  STATUS_FETCH_SOURCE_FAIL,
  CONTEXT_FETCH_SUCCESS,
  createStatus,
  editStatus,
  fetchStatus,
  updateStatus,
  fetchContext,
  type StatusesAction,
};
