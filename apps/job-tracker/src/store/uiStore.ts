import { z } from 'zod';
import { create } from 'zustand';
import { loadPersistedState, savePersistedState } from './persistedState';

const persistedUiStateSchema = z.object({
  isManualJobFormOpen: z.boolean().optional(),
});

interface UIState {
  isManualJobFormOpen: boolean;
  openManualJobForm: () => void;
  closeManualJobForm: () => void;
}

const STORAGE_KEY = 'job-tracker-ui';

const loadState = (): Partial<z.infer<typeof persistedUiStateSchema>> =>
  loadPersistedState(STORAGE_KEY, persistedUiStateSchema);

const saveState = (state: UIState) => {
  savePersistedState(STORAGE_KEY, {
    isManualJobFormOpen: state.isManualJobFormOpen,
  });
};

export const useUIStore = create<UIState>((set, get) => {
  const initialState = loadState();

  return {
    isManualJobFormOpen: initialState.isManualJobFormOpen ?? false,
    openManualJobForm: () => {
      set({ isManualJobFormOpen: true });
      saveState(get());
    },
    closeManualJobForm: () => {
      set({ isManualJobFormOpen: false });
      saveState(get());
    },
  };
});
