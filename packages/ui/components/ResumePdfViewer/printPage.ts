/**
 * Shared print-page surface styles for resume documents. Both
 * `ResumePdfViewer` (job-tracker) and the portfolio's `ResumeDocument`
 * render the same "printed page" language — keep the shared subset here
 * so the two surfaces cannot drift.
 */
export const resumePrintPageSx = {
  boxSizing: 'border-box',
  boxShadow: 1,
  fontFamily: 'system-ui, sans-serif',
  fontSize: 13,
  lineHeight: 1.5,
  '@media print': {
    width: '100%',
    maxWidth: 'none',
    m: 0,
    border: 0,
    p: '14mm',
    boxShadow: 'none',
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
  },
} as const;
