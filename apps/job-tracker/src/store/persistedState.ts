import type { z } from 'zod';
import { storageGetJson, storageSetJson } from '../app/storage';

export function loadPersistedState<T extends object>(
  storageKey: string,
  schema: z.ZodType<T>,
): Partial<T> {
  const parsed = schema.safeParse(storageGetJson(storageKey));
  return parsed.success ? parsed.data : {};
}

export function savePersistedState(storageKey: string, state: unknown): void {
  storageSetJson(storageKey, state);
}
