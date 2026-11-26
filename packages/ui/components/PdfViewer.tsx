import {
  Box,
  Button,
  GlobalStyles,
  Paper,
  Stack,
  type Theme,
} from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { type ReactNode, useCallback, useRef } from 'react';
import { printElement } from './printElement';
import {
  RESUME_PRINT_CLASS,
  resumePrintGlobalStyles,
  resumePrintPageSx,
} from './printPage';

export interface PdfViewerProps {
  /** When set, renders a print/PDF button above the page. */
  printLabel?: string | undefined;
  /**
   * Single-page content rendered inside the A4-styled paper, spaced like
   * the resume document sections.
   */
  children?: ReactNode;
  /**
   * Paged rendering: when provided, replaces the single-page paper. The
   * tree is stacked as fixed pages inside the print target (e.g. the
   * output of `PagedResume`).
   */
  pagedContent?: ReactNode;
  /** Extra styles merged into the single-page paper (e.g. max-width, centering). */
  pageSx?: SystemStyleObject<Theme> | undefined;
}

/**
 * Generic print-ready document viewer: owns the print button, the
 * print-target ref, the print global styles, and the single-page paper
 * chrome. Domain viewers (e.g. `ResumePdfViewer`) supply the content.
 */
export function PdfViewer({
  printLabel,
  children,
  pagedContent,
  pageSx,
}: PdfViewerProps) {
  const printTargetRef = useRef<HTMLElement | null>(null);
  const setPrintTarget = useCallback((element: HTMLElement | null) => {
    printTargetRef.current = element;
  }, []);

  return (
    <>
      <GlobalStyles styles={resumePrintGlobalStyles} />
      {printLabel ? (
        <Stack direction="row" sx={{ mb: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (printTargetRef.current) {
                printElement(printTargetRef.current);
              }
            }}
          >
            {printLabel}
          </Button>
        </Stack>
      ) : null}
      {pagedContent ? (
        <Box
          ref={setPrintTarget}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            '@media print': { gap: 0 },
          }}
        >
          {pagedContent}
        </Box>
      ) : (
        <Paper
          ref={setPrintTarget}
          className={RESUME_PRINT_CLASS}
          component="article"
          variant="outlined"
          square
          elevation={0}
          sx={{
            width: '100%',
            p: { xs: 2.5, sm: 4 },
            ...resumePrintPageSx,
            ...pageSx,
          }}
        >
          <Stack spacing={3}>{children}</Stack>
        </Paper>
      )}
    </>
  );
}
