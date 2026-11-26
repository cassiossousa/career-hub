import { useState } from 'react';
import { useDocumentDraft } from './useDocumentDraft';

/**
 * Document-editor state plus the save-in-progress flag shared by the
 * row-editor forms (skills, facts): draft/baseline dirty tracking,
 * submit feedback, the unsaved-changes blocker, and `isSaving`.
 */
export function useDocumentForm<T extends object>(
  initial: T,
  guardEnabled = true,
  allowSamePathNavigation = false,
) {
  const draft = useDocumentDraft<T>(
    initial,
    guardEnabled,
    allowSamePathNavigation,
  );
  const [isSaving, setIsSaving] = useState(false);
  return { ...draft, isSaving, setIsSaving };
}
