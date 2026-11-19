import { storageGetItem, storageRemoveItem } from '../app/storage';
import { useFilterStore } from './filterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    storageRemoveItem('job-tracker-filters');
    useFilterStore.getState().resetFilters();
  });

  it('persists filter changes to storage', () => {
    useFilterStore.getState().setLevel('senior');
    const stored = storageGetItem('job-tracker-filters');
    expect(stored).not.toBeNull();
    if (stored === null) throw new Error('expected persisted filters');
    const parsed: unknown = JSON.parse(stored);
    expect(parsed).toMatchObject({ level: 'senior' });
  });

  it('resetFilters clears all filters and persisted state', () => {
    const store = useFilterStore.getState();
    store.setLevel('senior');
    store.setRemoteOnly(true);
    store.setMinMatchScore(80);
    store.resetFilters();

    const state = useFilterStore.getState();
    expect(state.level).toBeUndefined();
    expect(state.remoteOnly).toBe(false);
    expect(state.minMatchScore).toBeUndefined();
    expect(state.preset).toBeNull();
  });

  it('toggles profile preset', () => {
    useFilterStore.getState().setPreset('profile');
    expect(useFilterStore.getState().preset).toBe('profile');
    useFilterStore.getState().setPreset(null);
    expect(useFilterStore.getState().preset).toBeNull();
  });
});

it('updates area, age, sort and match score filters', () => {
  const store = useFilterStore.getState();
  store.setArea('backend');
  store.setMaxAgeDays(30);
  store.setSort('match_score_desc');
  store.setLocation('São Paulo');

  const state = useFilterStore.getState();
  expect(state.area).toBe('backend');
  expect(state.maxAgeDays).toBe(30);
  expect(state.sort).toBe('match_score_desc');
  expect(state.location).toBe('São Paulo');
});
