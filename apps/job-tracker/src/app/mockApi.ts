import type { DataMode } from './env';
import { storageGetItem, storageSetItem } from './storage';

export const MOCK_API_STORAGE_KEY = 'job-tracker-mock-api';

interface MockApiEnv {
  isDev: boolean;
  dataMode: DataMode;
}

export function isMockApiEnabled(env: MockApiEnv): boolean {
  if (!env.isDev) return env.dataMode === 'demo';
  const override = storageGetItem(MOCK_API_STORAGE_KEY);
  if (override === 'on') return true;
  if (override === 'off') return false;
  return env.dataMode === 'demo';
}

export function setMockApiEnabled(enabled: boolean): void {
  storageSetItem(MOCK_API_STORAGE_KEY, enabled ? 'on' : 'off');
}
