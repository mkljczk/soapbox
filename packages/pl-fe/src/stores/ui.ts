import { create } from 'zustand';

type State = {
  isDropdownMenuOpen: boolean;
  openDropdownMenu: () => void;
  closeDropdownMenu: () => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const useUiStore = create<State>((set) => ({
  isDropdownMenuOpen: false,
  openDropdownMenu: () => set({ isDropdownMenuOpen: true }),
  closeDropdownMenu: () => set({ isDropdownMenuOpen: false }),
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));

export { useUiStore };

