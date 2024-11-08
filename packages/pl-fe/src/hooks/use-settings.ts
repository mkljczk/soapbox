import { useSettingsStore } from 'pl-fe/stores/settings';

/** Get the user settings from the store */
const useSettings = () => useSettingsStore().settings;

export { useSettings };
