import { storageGetItem, storageRemoveItem } from '../app/storage';
import { FILTERS_STORAGE_KEY, useFilterStore } from './filterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    storageRemoveItem(FILTERS_STORAGE_KEY);
    useFilterStore.getState().resetFilters();
  });

  it('persists filter changes to storage', () => {
    useFilterStore.getState().setLevel('senior');
    const stored = storageGetItem(FILTERS_STORAGE_KEY);
    expect(stored).not.toBeNull();
    if (stored === null) throw new Error('expected persisted filters');
    const parsed: unknown = JSON.parse(stored);
    expect(parsed).toMatchObject({ level: 'senior' });
  });

  it('resetFilters clears all filters and persisted state', () => {
    const store = useFilterStore.getState();
    store.setLevel('senior');
    store.setRemoteOnly(true);
    store.setMaxAgeDays(30);
    store.resetFilters();

    const state = useFilterStore.getState();
    expect(state.level).toBeUndefined();
    expect(state.remoteOnly).toBe(false);
    expect(state.maxAgeDays).toBeUndefined();
    expect(state.preset).toBeNull();
  });

  it('toggles profile preset', () => {
    useFilterStore.getState().setPreset('profile');
    expect(useFilterStore.getState().preset).toBe('profile');
    useFilterStore.getState().setPreset(null);
    expect(useFilterStore.getState().preset).toBeNull();
  });

  it('updates area, age and location filters', () => {
    const store = useFilterStore.getState();
    store.setArea('backend');
    store.setMaxAgeDays(30);
    store.setLocation('São Paulo');

    const state = useFilterStore.getState();
    expect(state.area).toBe('backend');
    expect(state.maxAgeDays).toBe(30);
    expect(state.location).toBe('São Paulo');
  });
});
