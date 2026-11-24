import { storageRemoveItem } from '../app/storage';
import { UI_STORAGE_KEY, useUIStore } from './uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    storageRemoveItem(UI_STORAGE_KEY);
    useUIStore.setState({ isManualJobFormOpen: false });
  });

  it('opens and closes the manual job form', () => {
    expect(useUIStore.getState().isManualJobFormOpen).toBe(false);
    useUIStore.getState().openManualJobForm();
    expect(useUIStore.getState().isManualJobFormOpen).toBe(true);
    useUIStore.getState().closeManualJobForm();
    expect(useUIStore.getState().isManualJobFormOpen).toBe(false);
  });
});
