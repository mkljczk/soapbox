import { create } from 'zustand';

type State = {
  ref: React.MutableRefObject<HTMLDivElement> | null;
  statusId: string | null;
  hovered: boolean;
  openStatusHoverCard: (ref: React.MutableRefObject<HTMLDivElement>, statusId: string) => void;
  updateStatusHoverCard: () => void;
  closeStatusHoverCard: (force?: boolean) => void;
}

const useStatusHoverCardStore = create<State>((set) => ({
  ref: null,
  statusId: null,
  hovered: false,
  openStatusHoverCard: (ref, statusId) => set({
    ref,
    statusId,
  }),
  updateStatusHoverCard: () => set({
    hovered: true,
  }),
  closeStatusHoverCard: (force = false) => set((state) => state.hovered && !force ? {} : {
    ref: null,
    statusId: null,
    hovered: false,
  }),
}));

export { useStatusHoverCardStore };

