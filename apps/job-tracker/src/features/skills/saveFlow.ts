import type { FormFeedback } from '../../app/useDocumentDraft';
import { errorMessage } from '../../components/AsyncStatus/AsyncStatus';

interface SaveContext {
  setIsSaving: (saving: boolean) => void;
  setFeedback: (feedback: FormFeedback | null) => void;
}

/**
 * Shared batch-save flow for the skills editors: runs the mutations, then
 * invalidates the relevant queries on both success and failure so the tables
 * resync with whatever the server actually persisted.
 */
export async function runSkillSave(
  { setIsSaving, setFeedback }: SaveContext,
  invalidate: () => Promise<unknown>,
  work: () => Promise<void>,
  successText: string,
  onSaved?: () => void,
): Promise<void> {
  setIsSaving(true);
  try {
    await work();
    await invalidate();
    onSaved?.();
    setFeedback({ type: 'success', text: successText });
  } catch (error) {
    await invalidate();
    setFeedback({ type: 'error', text: errorMessage(error) });
  } finally {
    setIsSaving(false);
  }
}
