import { storageGetItem, storageSetItem } from './storage';

const STORAGE_KEY = 'job-tracker-mock-api';

interface MockApiEnv {
  isDev: boolean;
  mockApi: boolean;
}

export function isMockApiEnabled(env: MockApiEnv): boolean {
  if (!env.isDev) return false;
  const override = storageGetItem(STORAGE_KEY);
  if (override === 'on') return true;
  if (override === 'off') return false;
  return env.mockApi;
}

export function setMockApiEnabled(enabled: boolean): void {
  storageSetItem(STORAGE_KEY, enabled ? 'on' : 'off');
}
