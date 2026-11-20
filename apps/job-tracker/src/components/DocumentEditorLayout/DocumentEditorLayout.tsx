import type {
  ResumePdfDocument,
  ResumePdfViewerLabels,
} from '@career-hub/ui/components';
import { ResumePdfViewer } from '@career-hub/ui/components';
import { Alert, Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { FormFeedback } from '../../app/useDocumentDraft';
import { FormCard } from '../FormCard/FormCard';

interface DocumentEditorLayoutProps {
  onSubmit: (event: React.FormEvent) => void;
  feedback: FormFeedback | null;
  previewTitle: string;
  previewDocument: ResumePdfDocument;
  previewLabels: ResumePdfViewerLabels;
  children: ReactNode;
}

export function DocumentEditorLayout({
  onSubmit,
  feedback,
  previewTitle,
  previewDocument,
  previewLabels,
  children,
}: DocumentEditorLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 3,
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ flex: '1 1 55%', minWidth: 0 }}>
        <FormCard onSubmit={onSubmit}>
          {feedback && <Alert severity={feedback.type}>{feedback.text}</Alert>}
          {children}
        </FormCard>
      </Box>
      <Box
        component="aside"
        aria-label={previewTitle}
        sx={{
          flex: '1 1 45%',
          minWidth: 0,
          width: '100%',
          position: { lg: 'sticky' },
          top: { lg: '16px' },
          maxHeight: { lg: 'calc(100vh - 32px)' },
          overflowY: 'auto',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {previewTitle}
        </Typography>
        <ResumePdfViewer document={previewDocument} labels={previewLabels} />
      </Box>
    </Box>
  );
}
