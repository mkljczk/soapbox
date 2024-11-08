import { useModalsStore } from 'pl-fe/stores/modals';

import type { Account } from 'pl-fe/normalizers/account';
import type { AppDispatch } from 'pl-fe/store';

const MUTES_INIT_MODAL = 'MUTES_INIT_MODAL';
const MUTES_TOGGLE_HIDE_NOTIFICATIONS = 'MUTES_TOGGLE_HIDE_NOTIFICATIONS';
const MUTES_CHANGE_DURATION = 'MUTES_CHANGE_DURATION';

const initMuteModal = (account: Account) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: MUTES_INIT_MODAL,
      account,
    });

    useModalsStore.getState().openModal('MUTE');
  };

const toggleHideNotifications = () =>
  (dispatch: AppDispatch) => {
    dispatch({ type: MUTES_TOGGLE_HIDE_NOTIFICATIONS });
  };

const changeMuteDuration = (duration: number) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: MUTES_CHANGE_DURATION,
      duration,
    });
  };

export {
  MUTES_INIT_MODAL,
  MUTES_TOGGLE_HIDE_NOTIFICATIONS,
  MUTES_CHANGE_DURATION,
  initMuteModal,
  toggleHideNotifications,
  changeMuteDuration,
};
