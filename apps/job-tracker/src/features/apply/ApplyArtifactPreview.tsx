import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useClipboard } from '../../app/useClipboard';
import {
  EmptyState,
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useApplyArtifact } from '../../services/api/applyRuns';

interface ApplyArtifactPreviewProps {
  runId: number;
  name: string;
  open: boolean;
  onClose: () => void;
}

export function ApplyArtifactPreview({
  runId,
  name,
  open,
  onClose,
}: ApplyArtifactPreviewProps) {
  const { messages } = useTranslation();
  const { copy, copied } = useClipboard();
  const artifactQuery = useApplyArtifact(runId, name, { enabled: open });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{name}</DialogTitle>
      <DialogContent>
        {artifactQuery.isLoading && (
          <LoadingState label={messages.common.loading} />
        )}
        {artifactQuery.isError && (
          <QueryErrorAlert
            error={artifactQuery.error}
            subject={name}
            onRetry={() => void artifactQuery.refetch()}
          />
        )}
        {artifactQuery.data !== undefined && (
          <Typography
            component="pre"
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
          >
            {artifactQuery.data.text}
          </Typography>
        )}
        {artifactQuery.data === undefined &&
          !artifactQuery.isLoading &&
          !artifactQuery.isError && (
            <EmptyState title={messages.common.notFound} />
          )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{messages.common.close}</Button>
        <Button
          disabled={artifactQuery.data === undefined}
          onClick={() => {
            if (artifactQuery.data !== undefined) {
              copy(artifactQuery.data.text);
            }
          }}
        >
          {copied ? messages.apply.review.copied : messages.apply.review.copy}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
