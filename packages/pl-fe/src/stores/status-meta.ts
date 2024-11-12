import { produce } from 'immer';
import { create } from 'zustand';

type State = {
  statuses: Record<string, { visible?: boolean; targetLanguage?: string; currentLanguage?: string }>;
  revealStatus: (statusId: string) => void;
  hideStatus: (statusId: string) => void;
  fetchTranslation: (statusId: string, targetLanguage: string) => void;
  hideTranslation: (statusId: string) => void;
};

const useStatusMetaStore = create<State>((set) => ({
  statuses: {},
  revealStatus: (statusId) => set(produce((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].visible = true;
  })),
  hideStatus: (statusId) => set(produce((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].visible = false;
  })),
  fetchTranslation: (statusId, targetLanguage) => set(produce((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].targetLanguage = targetLanguage;
  })),
  hideTranslation: (statusId) => set(produce((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].targetLanguage = undefined;
  })),
}));

export { useStatusMetaStore };
