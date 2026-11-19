import { z } from 'zod';
import { create } from 'zustand';
import { JOB_AREAS, JOB_LEVELS, JOB_SORT_ORDERS } from '../services/jobOptions';
import type { JobArea, JobLevel, JobSortOrder } from '../services/types/job';
import { loadPersistedState, savePersistedState } from './persistedState';

const persistedFilterStateSchema = z.object({
  level: z.enum(JOB_LEVELS).optional(),
  location: z.string().optional(),
  area: z.enum(JOB_AREAS).optional(),
  remoteOnly: z.boolean().optional(),
  minMatchScore: z.number().optional(),
  maxAgeDays: z.number().optional(),
  sort: z.enum(JOB_SORT_ORDERS).optional(),
  preset: z.enum(['profile']).nullable().optional(),
});

interface FilterState {
  level?: JobLevel | undefined;
  location?: string | undefined;
  area?: JobArea | undefined;
  remoteOnly: boolean;
  minMatchScore?: number | undefined;
  maxAgeDays?: number | undefined;
  sort?: JobSortOrder | undefined;
  preset: 'profile' | null;
  setLevel: (level?: JobLevel) => void;
  setLocation: (location?: string) => void;
  setArea: (area?: JobArea) => void;
  setRemoteOnly: (remoteOnly: boolean) => void;
  setMinMatchScore: (score?: number) => void;
  setMaxAgeDays: (days?: number) => void;
  setSort: (sort?: JobSortOrder) => void;
  setPreset: (preset: 'profile' | null) => void;
  resetFilters: () => void;
}

type PersistedFilterState = z.infer<typeof persistedFilterStateSchema>;

const STORAGE_KEY = 'job-tracker-filters';

const loadState = (): Partial<PersistedFilterState> =>
  loadPersistedState(STORAGE_KEY, persistedFilterStateSchema);

const saveState = (state: PersistedFilterState) => {
  savePersistedState(STORAGE_KEY, state);
};

export const useFilterStore = create<FilterState>((set, get) => {
  const initialState = loadState();

  return {
    level: initialState.level,
    location: initialState.location,
    area: initialState.area,
    remoteOnly: initialState.remoteOnly ?? false,
    minMatchScore: initialState.minMatchScore,
    maxAgeDays: initialState.maxAgeDays,
    sort: initialState.sort,
    preset: initialState.preset ?? null,
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
    setMinMatchScore: (minMatchScore) => {
      set({ minMatchScore });
      saveState(get());
    },
    setMaxAgeDays: (maxAgeDays) => {
      set({ maxAgeDays });
      saveState(get());
    },
    setSort: (sort) => {
      set({ sort });
      saveState(get());
    },
    setPreset: (preset) => {
      set({ preset });
      saveState(get());
    },
    resetFilters: () => {
      const newState: PersistedFilterState = {
        level: undefined,
        location: undefined,
        area: undefined,
        remoteOnly: false,
        minMatchScore: undefined,
        maxAgeDays: undefined,
        sort: undefined,
        preset: null,
      };
      set({ ...newState, remoteOnly: false, preset: newState.preset ?? null });
      saveState(newState);
    },
  };
});
