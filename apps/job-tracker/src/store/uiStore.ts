import { systemThemeMode, type ThemeMode } from '@career-hub/ui/theme';
import { z } from 'zod';
import { create } from 'zustand';
import { loadPersistedState, savePersistedState } from './persistedState';

const persistedUiStateSchema = z.object({
  isManualJobFormOpen: z.boolean().optional(),
  themeMode: z.enum(['light', 'dark']).optional(),
  weeklyGoal: z.number().int().min(1).max(100).optional(),
});

interface UIState {
  isManualJobFormOpen: boolean;
  themeMode: ThemeMode;
  weeklyGoal: number;
  openManualJobForm: () => void;
  closeManualJobForm: () => void;
  toggleThemeMode: () => void;
  setWeeklyGoal: (goal: number) => void;
}

const STORAGE_KEY = 'job-tracker-ui';

const loadState = (): Partial<z.infer<typeof persistedUiStateSchema>> =>
  loadPersistedState(STORAGE_KEY, persistedUiStateSchema);

const saveState = (state: UIState) => {
  savePersistedState(STORAGE_KEY, {
    isManualJobFormOpen: state.isManualJobFormOpen,
    themeMode: state.themeMode,
    weeklyGoal: state.weeklyGoal,
  });
};

export const useUIStore = create<UIState>((set, get) => {
  const initialState = loadState();

  return {
    isManualJobFormOpen: initialState.isManualJobFormOpen ?? false,
    themeMode: initialState.themeMode ?? systemThemeMode(),
    weeklyGoal: initialState.weeklyGoal ?? 5,
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
    setWeeklyGoal: (weeklyGoal) => {
      set({ weeklyGoal });
      saveState(get());
    },
  };
});
