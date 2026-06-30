import { create } from 'zustand';

interface UIState {
  addWordSheetOpen: boolean;
  iosInstallPromptSeen: boolean;
  setAddWordSheetOpen: (open: boolean) => void;
  setIosInstallPromptSeen: (seen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  addWordSheetOpen: false,
  iosInstallPromptSeen: false,
  setAddWordSheetOpen: (open) => set({ addWordSheetOpen: open }),
  setIosInstallPromptSeen: (seen) => set({ iosInstallPromptSeen: seen }),
}));
