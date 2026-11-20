import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Blocks SPA navigation and tab close/reload while `dirty` is true.
 * Returns the react-router blocker so callers can render a confirm dialog.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const blocker = useBlocker(dirty);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [dirty]);

  return blocker;
}
