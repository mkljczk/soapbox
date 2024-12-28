import * as v from 'valibot';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { settingsSchema, type Settings } from 'pl-fe/schemas/pl-fe/settings';

import type { Emoji } from 'pl-fe/features/emoji';
import type { APIEntity } from 'pl-fe/types/entities';

const settingsSchemaPartial = v.partial(settingsSchema);

type State = {
  defaultSettings: Settings;
  userSettings: Partial<Settings>;

  settings: Settings;

  loadDefaultSettings: (settings: APIEntity) => void;
  loadUserSettings: (settings: APIEntity) => void;
  userSettingsSaving: () => void;
  changeSetting: (path: string[], value: any) => void;
  rememberEmojiUse: (emoji: Emoji) => void;
  rememberLanguageUse: (language: string) => void;
  rememberSearch: (value: string) => void;
  forgetSearch: (value: string) => void;
  handleSwitchPinnedSearch: (value: string) => void;
}

const changeSetting = (object: APIEntity, path: string[], value: any) => {
  if (path.length === 1) {
    object[path[0]] = value;
    return;
  }

  if (typeof object[path[0]] !== 'object') object[path[0]] = {};
  return changeSetting(object[path[0]], path.slice(1), value);
};

const mergeSettings = (state: State) => state.settings = { ...state.defaultSettings, ...state.userSettings };

const useSettingsStore = create<State>()(mutative((set) => ({
  defaultSettings: v.parse(settingsSchema, {}),
  userSettings: {},

  settings: v.parse(settingsSchema, {}),

  loadDefaultSettings: (settings: APIEntity) => set((state: State) => {
    if (typeof settings !== 'object') return;

    state.defaultSettings = v.parse(settingsSchema, settings);
    mergeSettings(state);
  }),

  loadUserSettings: (settings?: APIEntity) => set((state: State) => {
    if (typeof settings !== 'object') return;

    state.userSettings = v.parse(settingsSchemaPartial, settings);
    mergeSettings(state);
  }),

  userSettingsSaving: () => set((state: State) => {
    state.userSettings.saved = true;

    mergeSettings(state);
  }),

  changeSetting: (path: string[], value: any) => set((state: State) => {
    state.userSettings.saved = false;
    changeSetting(state.userSettings, path, value);

    mergeSettings(state);
  }),

  rememberEmojiUse: (emoji: Emoji) => set((state: State) => {
    const settings = state.userSettings;
    if (!settings.frequentlyUsedEmojis) settings.frequentlyUsedEmojis = {};

    settings.frequentlyUsedEmojis[emoji.id] = (settings.frequentlyUsedEmojis[emoji.id] || 0) + 1;
    settings.saved = false;

    mergeSettings(state);
  }),

  rememberLanguageUse: (language: string) => set((state: State) => {
    const settings = state.userSettings;
    if (!settings.frequentlyUsedLanguages) settings.frequentlyUsedLanguages = {};

    settings.frequentlyUsedLanguages[language] = (settings.frequentlyUsedLanguages[language] || 0) + 1;
    settings.saved = false;

    mergeSettings(state);
  }),

  rememberSearch: (value: string) => set((state: State) => {
    const settings = state.userSettings;

    if (!settings.rememberSearchHistory) return;

    if (!settings.recentSearches) settings.recentSearches = [];
    settings.recentSearches = [...new Set([value, ...settings.recentSearches])];

    mergeSettings(state);
  }),

  forgetSearch: (value: string) => set((state: State) => {
    const settings = state.userSettings;
    settings.recentSearches = settings.recentSearches?.filter((recentSearch) => recentSearch !== value);

    mergeSettings(state);
  }),

  handleSwitchPinnedSearch: (value: string) => set((state: State) => {
    const settings = state.userSettings;
    if (!settings.pinnedSearches) settings.pinnedSearches = [];

    if (settings.pinnedSearches.includes(value)) {
      settings.pinnedSearches = settings.pinnedSearches.filter((pinnedSearch) => pinnedSearch !== value);
    } else {
      settings.pinnedSearches = [value, ...settings.pinnedSearches];
    }

    mergeSettings(state);
  }),
}), { enableAutoFreeze: true }));

export { useSettingsStore };

