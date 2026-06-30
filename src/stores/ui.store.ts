import { create } from 'zustand';

interface UIState {
  _placeholder: null; // Phase 2 adds: addWordSheetOpen, etc.
}

export const useUIStore = create<UIState>(() => ({
  _placeholder: null,
}));
