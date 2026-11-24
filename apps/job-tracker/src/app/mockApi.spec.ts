import {
  isMockApiEnabled,
  MOCK_API_STORAGE_KEY,
  setMockApiEnabled,
} from './mockApi';
import { storageRemoveItem } from './storage';

describe('mockApi', () => {
  beforeEach(() => {
    storageRemoveItem(MOCK_API_STORAGE_KEY);
  });

  afterEach(() => {
    storageRemoveItem(MOCK_API_STORAGE_KEY);
  });

  it('is always disabled outside dev builds', () => {
    expect(isMockApiEnabled({ isDev: false, mockApi: true })).toBe(false);
  });

  it('falls back to the env default when no override is stored', () => {
    expect(isMockApiEnabled({ isDev: true, mockApi: true })).toBe(true);
    expect(isMockApiEnabled({ isDev: true, mockApi: false })).toBe(false);
  });

  it('honors the persisted override in both directions', () => {
    setMockApiEnabled(false);
    expect(isMockApiEnabled({ isDev: true, mockApi: true })).toBe(false);

    setMockApiEnabled(true);
    expect(isMockApiEnabled({ isDev: true, mockApi: false })).toBe(true);
  });
});
