import { errorMessage } from '../components/AsyncStatus/AsyncStatus';
import type { FormFeedback } from './useDocumentDraft';

interface SaveFeedbackOptions {
  savedText: string;
  setFeedback: (feedback: FormFeedback | null) => void;
  onSaved: () => void;
}

export function saveFeedbackOptions({
  savedText,
  setFeedback,
  onSaved,
}: SaveFeedbackOptions) {
  return {
    onSuccess: () => {
      onSaved();
      setFeedback({ type: 'success', text: savedText });
    },
    onError: (error: unknown) => {
      setFeedback({ type: 'error', text: errorMessage(error) });
    },
  };
}
