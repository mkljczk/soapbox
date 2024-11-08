import { changeSetting } from 'pl-fe/actions/settings';
import { useSettingsStore } from 'pl-fe/stores/settings';

import type { AppDispatch, RootState } from 'pl-fe/store';

const getPinnedHosts = (state: RootState) => {
  const { settings } = useSettingsStore.getState();
  return settings.remote_timeline.pinnedHosts;
};

const pinHost = (host: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const pinnedHosts = getPinnedHosts(state);

    return dispatch(changeSetting(['remote_timeline', 'pinnedHosts'], [...pinnedHosts, host]));
  };

const unpinHost = (host: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const pinnedHosts = getPinnedHosts(state);

    return dispatch(changeSetting(['remote_timeline', 'pinnedHosts'], pinnedHosts.filter(value => value !== host)));
  };

export {
  pinHost,
  unpinHost,
};
