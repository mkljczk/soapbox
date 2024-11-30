import { useModalsStore } from 'pl-fe/stores/modals';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { isLoggedIn } from 'pl-fe/utils/auth';
import { shouldHaveCard } from 'pl-fe/utils/status';

import { getClient } from '../api';

import { setComposeToStatus } from './compose';
import { importEntities } from './importer';
import { deleteFromTimelines } from './timelines';

import type { CreateStatusParams, Status as BaseStatus, ScheduledStatus } from 'pl-api';
import type { Status } from 'pl-fe/normalizers/status';
import type { AppDispatch, RootState } from 'pl-fe/store';
import type { IntlShape } from 'react-intl';

const STATUS_CREATE_REQUEST = 'STATUS_CREATE_REQUEST' as const;
const STATUS_CREATE_SUCCESS = 'STATUS_CREATE_SUCCESS' as const;
const STATUS_CREATE_FAIL = 'STATUS_CREATE_FAIL' as const;

const STATUS_FETCH_SOURCE_REQUEST = 'STATUS_FETCH_SOURCE_REQUEST' as const;
const STATUS_FETCH_SOURCE_SUCCESS = 'STATUS_FETCH_SOURCE_SUCCESS' as const;
const STATUS_FETCH_SOURCE_FAIL = 'STATUS_FETCH_SOURCE_FAIL' as const;

const STATUS_FETCH_REQUEST = 'STATUS_FETCH_REQUEST' as const;
const STATUS_FETCH_SUCCESS = 'STATUS_FETCH_SUCCESS' as const;
const STATUS_FETCH_FAIL = 'STATUS_FETCH_FAIL' as const;

const STATUS_DELETE_REQUEST = 'STATUS_DELETE_REQUEST' as const;
const STATUS_DELETE_SUCCESS = 'STATUS_DELETE_SUCCESS' as const;
const STATUS_DELETE_FAIL = 'STATUS_DELETE_FAIL' as const;

const CONTEXT_FETCH_REQUEST = 'CONTEXT_FETCH_REQUEST' as const;
const CONTEXT_FETCH_SUCCESS = 'CONTEXT_FETCH_SUCCESS' as const;
const CONTEXT_FETCH_FAIL = 'CONTEXT_FETCH_FAIL' as const;

const STATUS_MUTE_REQUEST = 'STATUS_MUTE_REQUEST' as const;
const STATUS_MUTE_SUCCESS = 'STATUS_MUTE_SUCCESS' as const;
const STATUS_MUTE_FAIL = 'STATUS_MUTE_FAIL' as const;

const STATUS_UNMUTE_REQUEST = 'STATUS_UNMUTE_REQUEST' as const;
const STATUS_UNMUTE_SUCCESS = 'STATUS_UNMUTE_SUCCESS' as const;
const STATUS_UNMUTE_FAIL = 'STATUS_UNMUTE_FAIL' as const;

const STATUS_REVEAL_MEDIA = 'STATUS_REVEAL_MEDIA' as const;
const STATUS_HIDE_MEDIA = 'STATUS_HIDE_MEDIA' as const;

const STATUS_EXPAND_SPOILER = 'STATUS_EXPAND_SPOILER' as const;
const STATUS_COLLAPSE_SPOILER = 'STATUS_COLLAPSE_SPOILER' as const;

const STATUS_UNFILTER = 'STATUS_UNFILTER' as const;

const STATUS_LANGUAGE_CHANGE = 'STATUS_LANGUAGE_CHANGE' as const;

const createStatus = (params: CreateStatusParams, idempotencyKey: string, statusId: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<StatusesAction>({ type: STATUS_CREATE_REQUEST, params, idempotencyKey, editing: !!statusId });

    return (statusId === null ? getClient(getState()).statuses.createStatus(params) : getClient(getState()).statuses.editStatus(statusId, params))
      .then((status) => {
        // The backend might still be processing the rich media attachment
        const expectsCard = status.scheduled_at === null && !status.card && shouldHaveCard(status);

        if (status.scheduled_at === null) dispatch(importEntities({ statuses: [{ ...status, expectsCard }] }, { idempotencyKey, withParents: true }));
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

  const status = state.statuses[statusId]!;
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
    dispatch<StatusesAction>({ type: STATUS_FETCH_REQUEST, statusId });

    const params = intl && useSettingsStore.getState().settings.autoTranslate ? {
      language: intl.locale,
    } : undefined;

    return getClient(getState()).statuses.getStatus(statusId, params).then(status => {
      dispatch(importEntities({ statuses: [status] }));
      dispatch<StatusesAction>({ type: STATUS_FETCH_SUCCESS, status });
      return status;
    }).catch(error => {
      dispatch<StatusesAction>({ type: STATUS_FETCH_FAIL, statusId, error, skipAlert: true });
    });
  };

const deleteStatus = (statusId: string, withRedraft = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const state = getState();

    const status = state.statuses[statusId]!;
    const poll = status.poll_id ? state.polls[status.poll_id] : undefined;

    dispatch<StatusesAction>({ type: STATUS_DELETE_REQUEST, params: status });

    return getClient(state).statuses.deleteStatus(statusId).then(response => {
      dispatch<StatusesAction>({ type: STATUS_DELETE_SUCCESS, statusId });
      dispatch(deleteFromTimelines(statusId));

      if (withRedraft) {
        dispatch(setComposeToStatus(status, poll, response.text || '', response.spoiler_text, response.content_type, withRedraft));
        useModalsStore.getState().openModal('COMPOSE');
      }
    })
      .catch(error => {
        dispatch<StatusesAction>({ type: STATUS_DELETE_FAIL, params: status, error });
      });
  };

const updateStatus = (status: BaseStatus) => (dispatch: AppDispatch) =>
  dispatch(importEntities({ statuses: [status] }));

const fetchContext = (statusId: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<StatusesAction>({ type: CONTEXT_FETCH_REQUEST, statusId });

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

      dispatch<StatusesAction>({ type: CONTEXT_FETCH_FAIL, statusId, error, skipAlert: true });
    });
  };

const fetchStatusWithContext = (statusId: string, intl?: IntlShape) =>
  async (dispatch: AppDispatch) => Promise.all([
    dispatch(fetchContext(statusId, intl)),
    dispatch(fetchStatus(statusId, intl)),
  ]);

const muteStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch<StatusesAction>({ type: STATUS_MUTE_REQUEST, statusId });
    return getClient(getState()).statuses.muteStatus(statusId).then((status) => {
      dispatch<StatusesAction>({ type: STATUS_MUTE_SUCCESS, statusId });
    }).catch(error => {
      dispatch<StatusesAction>({ type: STATUS_MUTE_FAIL, statusId, error });
    });
  };

const unmuteStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch<StatusesAction>({ type: STATUS_UNMUTE_REQUEST, statusId });
    return getClient(getState()).statuses.unmuteStatus(statusId).then(() => {
      dispatch<StatusesAction>({ type: STATUS_UNMUTE_SUCCESS, statusId });
    }).catch(error => {
      dispatch<StatusesAction>({ type: STATUS_UNMUTE_FAIL, statusId, error });
    });
  };

const toggleMuteStatus = (status: Pick<Status, 'id' | 'muted'>) =>
  (dispatch: AppDispatch) => {
    if (status.muted) {
      dispatch(unmuteStatus(status.id));
    } else {
      dispatch(muteStatus(status.id));
    }
  };

const hideStatusMedia = (statusIds: string[] | string) => {
  if (!Array.isArray(statusIds)) {
    statusIds = [statusIds];
  }

  return {
    type: STATUS_HIDE_MEDIA,
    statusIds,
  };
};

const revealStatusMedia = (statusIds: string[] | string) => {
  if (!Array.isArray(statusIds)) {
    statusIds = [statusIds];
  }

  return {
    type: STATUS_REVEAL_MEDIA,
    statusIds,
  };
};

const toggleStatusMediaHidden = (status: Pick<Status, 'id' | 'hidden'>) => {
  if (status.hidden) {
    return revealStatusMedia(status.id);
  } else {
    return hideStatusMedia(status.id);
  }
};

const collapseStatusSpoiler = (statusIds: string[] | string) => {
  if (!Array.isArray(statusIds)) {
    statusIds = [statusIds];
  }

  return {
    type: STATUS_COLLAPSE_SPOILER,
    statusIds,
  };
};

const expandStatusSpoiler = (statusIds: string[] | string) => {
  if (!Array.isArray(statusIds)) {
    statusIds = [statusIds];
  }

  return {
    type: STATUS_EXPAND_SPOILER,
    statusIds,
  };
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

const unfilterStatus = (statusId: string) => ({
  type: STATUS_UNFILTER,
  statusId,
});

const changeStatusLanguage = (statusId: string, language: string) => ({
  type: STATUS_LANGUAGE_CHANGE,
  statusId,
  language,
});

type StatusesAction =
  | { type: typeof STATUS_CREATE_REQUEST; params: CreateStatusParams; idempotencyKey: string; editing: boolean }
  | { type: typeof STATUS_CREATE_SUCCESS; status: BaseStatus | ScheduledStatus; params: CreateStatusParams; idempotencyKey: string; editing: boolean }
  | { type: typeof STATUS_CREATE_FAIL; error: unknown; params: CreateStatusParams; idempotencyKey: string; editing: boolean }
  | { type: typeof STATUS_FETCH_SOURCE_REQUEST }
  | { type: typeof STATUS_FETCH_SOURCE_SUCCESS }
  | { type: typeof STATUS_FETCH_SOURCE_FAIL; error: unknown }
  | { type: typeof STATUS_FETCH_REQUEST; statusId: string }
  | { type: typeof STATUS_FETCH_SUCCESS; status: BaseStatus }
  | { type: typeof STATUS_FETCH_FAIL; statusId: string; error: unknown; skipAlert: true }
  | { type: typeof STATUS_DELETE_REQUEST; params: Pick<Status, 'in_reply_to_id' | 'quote_id'> }
  | { type: typeof STATUS_DELETE_SUCCESS; statusId: string }
  | { type: typeof STATUS_DELETE_FAIL; params: Pick<Status, 'in_reply_to_id' | 'quote_id'>; error: unknown }
  | { type: typeof CONTEXT_FETCH_REQUEST; statusId: string }
  | { type: typeof CONTEXT_FETCH_SUCCESS; statusId: string; ancestors: Array<BaseStatus>; descendants: Array<BaseStatus> }
  | { type: typeof CONTEXT_FETCH_FAIL; statusId: string; error: unknown; skipAlert: true }
  | { type: typeof STATUS_MUTE_REQUEST; statusId: string }
  | { type: typeof STATUS_MUTE_SUCCESS; statusId: string }
  | { type: typeof STATUS_MUTE_FAIL; statusId: string; error: unknown }
  | { type: typeof STATUS_UNMUTE_REQUEST; statusId: string }
  | { type: typeof STATUS_UNMUTE_SUCCESS; statusId: string }
  | { type: typeof STATUS_UNMUTE_FAIL; statusId: string; error: unknown }
  | ReturnType<typeof hideStatusMedia>
  | ReturnType<typeof revealStatusMedia>
  | ReturnType<typeof collapseStatusSpoiler>
  | ReturnType<typeof expandStatusSpoiler>
  | ReturnType<typeof unfilterStatus>
  | ReturnType<typeof changeStatusLanguage>;

export {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
  STATUS_CREATE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
  STATUS_FETCH_SOURCE_FAIL,
  STATUS_FETCH_REQUEST,
  STATUS_FETCH_SUCCESS,
  STATUS_FETCH_FAIL,
  STATUS_DELETE_REQUEST,
  STATUS_DELETE_SUCCESS,
  STATUS_DELETE_FAIL,
  CONTEXT_FETCH_REQUEST,
  CONTEXT_FETCH_SUCCESS,
  CONTEXT_FETCH_FAIL,
  STATUS_MUTE_REQUEST,
  STATUS_MUTE_SUCCESS,
  STATUS_MUTE_FAIL,
  STATUS_UNMUTE_REQUEST,
  STATUS_UNMUTE_SUCCESS,
  STATUS_UNMUTE_FAIL,
  STATUS_REVEAL_MEDIA,
  STATUS_HIDE_MEDIA,
  STATUS_EXPAND_SPOILER,
  STATUS_COLLAPSE_SPOILER,
  STATUS_UNFILTER,
  STATUS_LANGUAGE_CHANGE,
  createStatus,
  editStatus,
  fetchStatus,
  deleteStatus,
  updateStatus,
  fetchContext,
  fetchStatusWithContext,
  muteStatus,
  unmuteStatus,
  toggleMuteStatus,
  hideStatusMedia,
  revealStatusMedia,
  toggleStatusMediaHidden,
  expandStatusSpoiler,
  collapseStatusSpoiler,
  unfilterStatus,
  changeStatusLanguage,
  type StatusesAction,
};
