import { create } from 'zustand';

type State = {
  ref: React.MutableRefObject<HTMLDivElement> | null;
  accountId: string | null;
  hovered: boolean;
  openAccountHoverCard: (ref: React.MutableRefObject<HTMLDivElement>, accountId: string) => void;
  updateAccountHoverCard: () => void;
  closeAccountHoverCard: (force?: boolean) => void;
}

const useAccountHoverCardStore = create<State>((set) => ({
  ref: null,
  accountId: null,
  hovered: false,
  openAccountHoverCard: (ref, accountId) => set({
    ref,
    accountId,
  }),
  updateAccountHoverCard: () => set({
    hovered: true,
  }),
  closeAccountHoverCard: (force = false) => set((state) => state.hovered && !force ? {} : {
    ref: null,
    accountId: null,
    hovered: false,
  }),
}));

export { useAccountHoverCardStore };

