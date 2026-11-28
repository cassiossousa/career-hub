import { Button, Stack, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type { ApplyRun } from '../../services/types/applyRun';

interface ApplyRunActionsProps {
  run: ApplyRun;
  editable: boolean;
  reviewable: boolean;
  retryable: boolean;
  dirty: boolean;
  pending: boolean;
  manualUrl: string | undefined;
  onSave: () => void;
  onApprove: () => void;
  onMarkSubmitted: () => void;
  onReject: () => void;
  onRetry: () => void;
  onRedraft: () => void;
  redraftDisabled: boolean;
}

export function ApplyRunActions({
  run,
  editable,
  reviewable,
  retryable,
  dirty,
  pending,
  manualUrl,
  onSave,
  onApprove,
  onMarkSubmitted,
  onReject,
  onRetry,
  onRedraft,
  redraftDisabled,
}: ApplyRunActionsProps) {
  const { messages } = useTranslation();

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {editable && (
          <Button
            variant="outlined"
            size="small"
            disabled={!dirty || pending}
            onClick={onSave}
          >
            {messages.apply.review.saveAnswers}
          </Button>
        )}
        {editable && (
          <Button
            variant="outlined"
            size="small"
            disabled={pending || redraftDisabled}
            onClick={onRedraft}
          >
            {messages.apply.review.redraft}
          </Button>
        )}
        {reviewable && (
          <Button
            variant="contained"
            size="small"
            disabled={pending}
            onClick={onApprove}
          >
            {messages.apply.review.approve}
          </Button>
        )}
        {run.status === 'approved' && (
          <Button
            variant="contained"
            size="small"
            disabled={pending}
            onClick={onMarkSubmitted}
          >
            {messages.apply.review.markSubmitted}
          </Button>
        )}
        {(reviewable || run.status === 'needs_human') && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={pending}
            onClick={onReject}
          >
            {messages.apply.review.reject}
          </Button>
        )}
        {retryable && (
          <Button
            variant="outlined"
            size="small"
            disabled={pending}
            onClick={onRetry}
          >
            {messages.apply.review.retry}
          </Button>
        )}
        {(run.status === 'ready_for_review' ||
          run.status === 'needs_human' ||
          run.status === 'approved') &&
          manualUrl !== undefined && (
            <Button
              variant="outlined"
              size="small"
              href={manualUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {messages.apply.review.fillManually}
            </Button>
          )}
      </Stack>
      {reviewable && (
        <Typography variant="caption" color="text.secondary">
          {messages.apply.review.approveHint}
        </Typography>
      )}
      {run.status === 'approved' && (
        <Typography variant="caption" color="text.secondary">
          {messages.apply.review.approvedHint}
        </Typography>
      )}
    </Stack>
  );
}
