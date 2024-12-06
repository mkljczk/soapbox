import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

type State = {
  statuses: Record<string, { expanded?: boolean; mediaVisible?: boolean; currentLanguage?: string; targetLanguage?: string }>;
  expandStatus: (statusId: string) => void;
  collapseStatus: (statusId: string) => void;
  revealStatusMedia: (statusId: string) => void;
  hideStatusMedia: (statusId: string) => void;
  toggleStatusMediaHidden: (statusId: string) => void;
  fetchTranslation: (statusId: string, targetLanguage: string) => void;
  hideTranslation: (statusId: string) => void;
  setStatusLanguage: (statusId: string, language: string) => void;
};

const useStatusMetaStore = create<State>()(mutative((set) => ({
  statuses: {},
  expandStatus: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].expanded = true;
  }),
  collapseStatus: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].expanded = false;
  }),
  revealStatusMedia: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].mediaVisible = true;
  }),
  hideStatusMedia: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].mediaVisible = false;
  }),
  toggleStatusMediaHidden: (statusId) => (state: State) => state[state.statuses[statusId].mediaVisible ? 'hideStatusMedia' : 'revealStatusMedia'](statusId),
  fetchTranslation: (statusId, targetLanguage) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].targetLanguage = targetLanguage;
  }),
  hideTranslation: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].targetLanguage = undefined;
  }),
  setStatusLanguage: (statusId, language) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].currentLanguage = language;
  }),
})));

export { useStatusMetaStore };
