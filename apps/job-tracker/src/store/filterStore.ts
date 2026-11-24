import { z } from 'zod';
import { create } from 'zustand';
import {
  JOB_AREAS,
  JOB_LEVELS,
  type JobArea,
  type JobLevel,
} from '../services/types/job';
import { loadPersistedState, savePersistedState } from './persistedState';

const persistedFilterStateSchema = z.object({
  level: z.enum(JOB_LEVELS).optional(),
  location: z.string().optional(),
  area: z.enum(JOB_AREAS).optional(),
  remoteOnly: z.boolean().optional(),
  maxAgeDays: z.number().optional(),
  preset: z.enum(['profile']).nullable().optional(),
  search: z.string().optional(),
});

interface FilterState {
  level?: JobLevel | undefined;
  location?: string | undefined;
  area?: JobArea | undefined;
  remoteOnly: boolean;
  maxAgeDays?: number | undefined;
  preset: 'profile' | null;
  search?: string | undefined;
  setLevel: (level?: JobLevel) => void;
  setLocation: (location?: string) => void;
  setArea: (area?: JobArea) => void;
  setRemoteOnly: (remoteOnly: boolean) => void;
  setMaxAgeDays: (days?: number) => void;
  setPreset: (preset: 'profile' | null) => void;
  setSearch: (search?: string) => void;
  resetFilters: () => void;
}

type PersistedFilterState = z.infer<typeof persistedFilterStateSchema>;

export const FILTERS_STORAGE_KEY = 'job-tracker-filters';

const loadState = (): Partial<PersistedFilterState> =>
  loadPersistedState(FILTERS_STORAGE_KEY, persistedFilterStateSchema);

const saveState = (state: PersistedFilterState) => {
  savePersistedState(FILTERS_STORAGE_KEY, state);
};

export const useFilterStore = create<FilterState>((set, get) => {
  const initialState = loadState();

  return {
    level: initialState.level,
    location: initialState.location,
    area: initialState.area,
    remoteOnly: initialState.remoteOnly ?? false,
    maxAgeDays: initialState.maxAgeDays,
    preset: initialState.preset ?? null,
    search: initialState.search,
    setLevel: (level) => {
      set({ level });
      saveState(get());
    },
    setLocation: (location) => {
      set({ location });
      saveState(get());
    },
    setArea: (area) => {
      set({ area });
      saveState(get());
    },
    setRemoteOnly: (remoteOnly) => {
      set({ remoteOnly });
      saveState(get());
    },
    setMaxAgeDays: (maxAgeDays) => {
      set({ maxAgeDays });
      saveState(get());
    },
    setPreset: (preset) => {
      set({ preset });
      saveState(get());
    },
    setSearch: (search) => {
      set({ search });
      saveState(get());
    },
    resetFilters: () => {
      const newState: PersistedFilterState = {
        level: undefined,
        location: undefined,
        area: undefined,
        remoteOnly: false,
        maxAgeDays: undefined,
        preset: null,
        search: undefined,
      };
      set({ ...newState, remoteOnly: false, preset: newState.preset ?? null });
      saveState(newState);
    },
  };
});
