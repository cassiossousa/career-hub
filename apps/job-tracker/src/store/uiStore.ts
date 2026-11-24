import { systemThemeMode, type ThemeMode } from '@career-hub/ui/theme';
import { z } from 'zod';
import { create } from 'zustand';
import { loadPersistedState, savePersistedState } from './persistedState';

const persistedUiStateSchema = z.object({
  isManualJobFormOpen: z.boolean().optional(),
  themeMode: z.enum(['light', 'dark']).optional(),
});

interface UIState {
  isManualJobFormOpen: boolean;
  themeMode: ThemeMode;
  openManualJobForm: () => void;
  closeManualJobForm: () => void;
  toggleThemeMode: () => void;
}

export const UI_STORAGE_KEY = 'job-tracker-ui';

const loadState = (): Partial<z.infer<typeof persistedUiStateSchema>> =>
  loadPersistedState(UI_STORAGE_KEY, persistedUiStateSchema);

const saveState = (state: UIState) => {
  savePersistedState(UI_STORAGE_KEY, {
    isManualJobFormOpen: state.isManualJobFormOpen,
    themeMode: state.themeMode,
  });
};

export const useUIStore = create<UIState>((set, get) => {
  const initialState = loadState();

  return {
    isManualJobFormOpen: initialState.isManualJobFormOpen ?? false,
    themeMode: initialState.themeMode ?? systemThemeMode(),
    openManualJobForm: () => {
      set({ isManualJobFormOpen: true });
      saveState(get());
    },
    closeManualJobForm: () => {
      set({ isManualJobFormOpen: false });
      saveState(get());
    },
    toggleThemeMode: () => {
      set({ themeMode: get().themeMode === 'dark' ? 'light' : 'dark' });
      saveState(get());
    },
  };
});
