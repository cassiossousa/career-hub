import { useState } from 'react';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';

export interface FormFeedback {
  type: 'success' | 'error';
  text: string;
}

/**
 * Shared document-editor state: draft + saved baseline for dirty tracking,
 * submit feedback, per-section setter, and the unsaved-changes blocker.
 */
export function useDocumentDraft<T extends object>(
  initial: T,
  guardEnabled = true,
  allowSamePathNavigation = false,
) {
  const [doc, setDoc] = useState<T>(() => initial);
  const [baseline, setBaseline] = useState<T>(() => initial);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);
  const dirty = JSON.stringify(doc) !== JSON.stringify(baseline);
  const blocker = useUnsavedChangesGuard(
    dirty && guardEnabled,
    allowSamePathNavigation,
  );

  const set = <K extends keyof T>(key: K, value: T[K]) => {
    setDoc((prev) => Object.assign({}, prev, { [key]: value }));
  };

  const bind =
    <K extends keyof T>(key: K) =>
    (value: T[K]) => {
      set(key, value);
    };

  return {
    doc,
    setDoc,
    baseline,
    setBaseline,
    feedback,
    setFeedback,
    blocker,
    dirty,
    set,
    bind,
  };
}
