import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

type State = {
  statuses: Record<string, { visible?: boolean; targetLanguage?: string }>;
  revealStatus: (statusId: string) => void;
  hideStatus: (statusId: string) => void;
  fetchTranslation: (statusId: string, targetLanguage: string) => void;
  hideTranslation: (statusId: string) => void;
};

const useStatusMetaStore = create<State>()(mutative((set) => ({
  statuses: {},
  revealStatus: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].visible = true;
  }),
  hideStatus: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].visible = false;
  }),
  fetchTranslation: (statusId, targetLanguage) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].targetLanguage = targetLanguage;
  }),
  hideTranslation: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].targetLanguage = undefined;
  }),
})));

export { useStatusMetaStore };
