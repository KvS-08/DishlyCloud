import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  collapsed: boolean;
  toggleSidebar: () => void;
  setSidebarState: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
      setSidebarState: (collapsed) => set({ collapsed })
    }),
    {
      name: 'sidebar-storage',
    }
  )
);