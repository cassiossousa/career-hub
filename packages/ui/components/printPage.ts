/**
 * Shared print-page surface styles for document viewers. `PdfViewer`
 * (and through it `ResumePdfViewer`) plus the portfolio's
 * `ResumeDocument` render the same "printed page" language — keep the
 * shared subset here so the surfaces cannot drift.
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

/** Class marking the element that should be the only printed content. */
export const RESUME_PRINT_CLASS = 'resume-print-page';

/**
 * Print output must contain only the resume page: every element that is not
 * the page, an ancestor of it, or a descendant of it is removed from the
 * printed layout (`:has()` keeps the ancestor chain visible). Render via
 * MUI `GlobalStyles` on any surface that prints a resume document.
 */
export const resumePrintGlobalStyles = {
  '@media print': {
    [`body *:not(:has(.${RESUME_PRINT_CLASS})):not(.${RESUME_PRINT_CLASS}):not(.${RESUME_PRINT_CLASS} *))`]:
      {
        display: 'none',
      },
  },
} as const;
