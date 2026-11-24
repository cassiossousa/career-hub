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

  it('is enabled in production only in demo mode', () => {
    expect(isMockApiEnabled({ isDev: false, dataMode: 'demo' })).toBe(true);
    expect(isMockApiEnabled({ isDev: false, dataMode: 'live' })).toBe(false);
  });

  it('ignores the persisted override outside dev builds', () => {
    setMockApiEnabled(false);
    expect(isMockApiEnabled({ isDev: false, dataMode: 'demo' })).toBe(true);

    setMockApiEnabled(true);
    expect(isMockApiEnabled({ isDev: false, dataMode: 'live' })).toBe(false);
  });

  it('falls back to the data mode when no override is stored', () => {
    expect(isMockApiEnabled({ isDev: true, dataMode: 'demo' })).toBe(true);
    expect(isMockApiEnabled({ isDev: true, dataMode: 'live' })).toBe(false);
  });

  it('honors the persisted override in both directions', () => {
    setMockApiEnabled(false);
    expect(isMockApiEnabled({ isDev: true, dataMode: 'demo' })).toBe(false);

    setMockApiEnabled(true);
    expect(isMockApiEnabled({ isDev: true, dataMode: 'live' })).toBe(true);
  });
});
