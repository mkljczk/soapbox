import { defineMessage } from 'react-intl';

import { patchMe } from 'pl-fe/actions/me';
import { getClient } from 'pl-fe/api';
import messages from 'pl-fe/messages';
import { queryClient } from 'pl-fe/queries/client';
import KVStore from 'pl-fe/storage/kv-store';
import { useSettingsStore } from 'pl-fe/stores/settings';
import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import type { AppDispatch, RootState } from 'pl-fe/store';
import type { NormalizedAccount as Account } from 'pl-hooks';

const FE_NAME = 'pl_fe';

/** Options when changing/saving settings. */
type SettingOpts = {
  /** Whether to display an alert when settings are saved. */
  showAlert?: boolean;
}

const saveSuccessMessage = defineMessage({ id: 'settings.save.success', defaultMessage: 'Your preferences have been saved!' });

const changeSetting = (path: string[], value: any, opts?: SettingOpts) => {
  useSettingsStore.getState().changeSetting(path, value);
  return saveSettings(opts);
};

const saveSettings = (opts?: SettingOpts) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const { userSettings, userSettingsSaving } = useSettingsStore.getState();
    if (userSettings.saved) return;

    const { saved, ...data } = userSettings;

    dispatch(updateSettingsStore(data)).then(() => {
      userSettingsSaving();

      if (opts?.showAlert) {
        toast.success(saveSuccessMessage);
      }
    }).catch(error => {
      toast.showAlertForError(error);
    });
  };

/** Update settings store for Mastodon, etc. */
const updateAuthAccount = (url: string, settings: any) => {
  const key = `authAccount:${url}`;
  return KVStore.getItem(key).then((oldAccount: any) => {
    if (!oldAccount) return;
    if (!oldAccount.settings_store) oldAccount.settings_store = {};
    oldAccount.settings_store[FE_NAME] = settings;
    KVStore.setItem(key, oldAccount);
  }).catch(console.error);
};

const updateSettingsStore = (settings: any) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const client = getClient(state);

    if (client.features.settingsStore) {
      return dispatch(patchMe({
        settings_store: {
          [FE_NAME]: settings,
        },
      }));
    } else {
      const accountUrl = queryClient.getQueryData<Account>(['accounts', 'entities', state.me])!.url;

      return updateAuthAccount(accountUrl, settings);
    }
  };

const getLocale = (fallback = 'en') => {
  const localeWithVariant = useSettingsStore.getState().settings.locale.replace('_', '-');
  const locale = localeWithVariant.split('-')[0];
  return Object.keys(messages).includes(localeWithVariant) ? localeWithVariant : Object.keys(messages).includes(locale) ? locale : fallback;
};

export {
  FE_NAME,
  changeSetting,
  saveSettings,
  updateSettingsStore,
  getLocale,
};
