function ignoreStorageError(call: () => void): void {
  try {
    call();
  } catch {
    // Storage unavailable (private mode, quota, disabled) — value stays in memory.
  }
}

export function storageGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageGetJson(key: string): unknown {
  const raw = storageGetItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storageSetItem(key: string, value: string) {
  ignoreStorageError(() => {
    localStorage.setItem(key, value);
  });
}

export function storageSetJson(key: string, value: unknown) {
  storageSetItem(key, JSON.stringify(value));
}

export function storageRemoveItem(key: string) {
  ignoreStorageError(() => {
    localStorage.removeItem(key);
  });
}
