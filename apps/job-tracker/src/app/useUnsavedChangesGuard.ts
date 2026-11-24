import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Blocks SPA navigation and tab close/reload while `dirty` is true.
 * Returns the react-router blocker so callers can render a confirm dialog.
 * When `allowSamePathNavigation` is set, only pathname changes are blocked —
 * same-page query updates (e.g. editor tab switches) keep the draft mounted.
 */
export function useUnsavedChangesGuard(
  dirty: boolean,
  allowSamePathNavigation = false,
) {
  const blocker = useBlocker(
    allowSamePathNavigation
      ? ({ currentLocation, nextLocation }) =>
          dirty && currentLocation.pathname !== nextLocation.pathname
      : dirty,
  );

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
