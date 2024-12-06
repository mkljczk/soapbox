import { changeSetting } from 'pl-fe/actions/settings';
import { useSettingsStore } from 'pl-fe/stores/settings';

import type { AppDispatch, RootState } from 'pl-fe/store';

const toggleMainWindow = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const main = useSettingsStore.getState().settings.chats.mainWindow;
    const state = main === 'minimized' ? 'open' : 'minimized';
    return dispatch(changeSetting(['chats', 'mainWindow'], state));
  };

export {
  toggleMainWindow,
};
