import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

type State = {
  statuses: Record<string, {
    expanded?: boolean;
    mediaVisible?: boolean;
    showFiltered?: boolean;
    currentLanguage?: string;
    targetLanguage?: string;
    deleted?: boolean;
  }>;
  expandStatus: (statusId: string) => void;
  collapseStatus: (statusId: string) => void;
  revealStatusMedia: (statusId: string) => void;
  hideStatusMedia: (statusId: string) => void;
  toggleStatusMediaHidden: (statusId: string) => void;
  showFilteredStatus: (statusId: string) => void;
  fetchTranslation: (statusId: string, targetLanguage: string) => void;
  hideTranslation: (statusId: string) => void;
  setStatusLanguage: (statusId: string, language: string) => void;
  setStatusDeleted: (statusId: string) => void;
};

const ensureStatus = (state: State, statusId: string) => {
  if (!state.statuses[statusId]) state.statuses[statusId] = {};
};

const useStatusMetaStore = create<State>()(mutative((set) => ({
  statuses: {},
  expandStatus: (statusId) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].expanded = true;
  }),
  collapseStatus: (statusId) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].expanded = false;
  }),
  revealStatusMedia: (statusId) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].mediaVisible = true;
  }),
  hideStatusMedia: (statusId) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].mediaVisible = false;
  }),
  toggleStatusMediaHidden: (statusId) => (state: State) => state[state.statuses[statusId]?.mediaVisible ? 'hideStatusMedia' : 'revealStatusMedia'](statusId),
  showFilteredStatus: (statusId) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].showFiltered = true;
  }),
  fetchTranslation: (statusId, targetLanguage) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].targetLanguage = targetLanguage;
  }),
  hideTranslation: (statusId) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].targetLanguage = undefined;
  }),
  setStatusLanguage: (statusId, language) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].currentLanguage = language;
  }),
  setStatusDeleted: (statusId) => set((state: State) => {
    ensureStatus(state, statusId);
    state.statuses[statusId].deleted = true;
  }),
})));

export { useStatusMetaStore };
