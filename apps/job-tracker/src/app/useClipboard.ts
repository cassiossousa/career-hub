import { useCallback, useEffect, useRef, useState } from 'react';

const COPIED_RESET_MS = 1500;

/** Copies text to the clipboard; `copied` stays true briefly for feedback. */
export function useClipboard(): {
  copy: (text: string) => void;
  copied: boolean;
} {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback((text: string) => {
    // `navigator.clipboard` is absent in insecure contexts and test DOMs.
    const clipboard = navigator.clipboard as Clipboard | undefined;
    if (clipboard === undefined) return;
    void clipboard.writeText(text).then(() => {
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, COPIED_RESET_MS);
    });
  }, []);

  return { copy, copied };
}
