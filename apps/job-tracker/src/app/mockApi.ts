import { storageGetItem, storageSetItem } from './storage';

export const MOCK_API_STORAGE_KEY = 'job-tracker-mock-api';

interface MockApiEnv {
  isDev: boolean;
  mockApi: boolean;
}

export function isMockApiEnabled(env: MockApiEnv): boolean {
  if (!env.isDev) return false;
  const override = storageGetItem(MOCK_API_STORAGE_KEY);
  if (override === 'on') return true;
  if (override === 'off') return false;
  return env.mockApi;
}

export function setMockApiEnabled(enabled: boolean): void {
  storageSetItem(MOCK_API_STORAGE_KEY, enabled ? 'on' : 'off');
}
