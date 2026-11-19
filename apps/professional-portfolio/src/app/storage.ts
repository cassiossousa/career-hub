export function storageGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, quota, disabled) — value stays in memory.
  }
}

export function storageRemoveItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable — nothing to remove.
  }
}
