import { Alert, Button, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { ApplyRunStatusChip } from '../../components/ApplyRunStatusChip/ApplyRunStatusChip';
import { useTranslation } from '../../i18n/Provider';
import {
  useRedraftApplyRun,
  useReviewApplyRun,
} from '../../services/api/applyRuns';
import { useJob } from '../../services/api/jobs';
import {
  dirtyAnswerEdits,
  draftAnswersFromRun,
} from '../../services/applyReview';
import type { ApplyRun } from '../../services/types/applyRun';
import { ApplyAnswersCard } from './ApplyAnswersCard';
import { ApplyArtifactsCard } from './ApplyArtifactsCard';
import { ApplyRunActions } from './ApplyRunActions';
import { ApplyRunOutcome } from './ApplyRunOutcome';
import { ApplyTailoringCard } from './ApplyTailoringCard';

export function ApplyRunReviewBody({ run }: { run: ApplyRun }) {
  const { messages } = useTranslation();
  const jobQuery = useJob(run.jobId);
  const reviewMutation = useReviewApplyRun();
  const redraftMutation = useRedraftApplyRun();
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    draftAnswersFromRun(run),
  );

  const editable =
    run.status === 'ready_for_review' ||
    (run.status === 'needs_human' && run.formFields.length > 0);
  const reviewable = run.status === 'ready_for_review';
  const retryable = run.status === 'failed' || run.status === 'needs_human';
  const artifactNames = Object.keys(run.artifacts);
  const dirty = Object.keys(dirtyAnswerEdits(draft, run)).length > 0;
  const pending = reviewMutation.isPending || redraftMutation.isPending;

  const redraft = () => {
    redraftMutation.mutate(
      { id: run.id },
      {
        onSuccess: (updated) => {
          setDraft(draftAnswersFromRun(updated));
        },
      },
    );
  };

  const redraftField = (fieldKey: string) => {
    redraftMutation.mutate(
      { id: run.id, fieldKey },
      {
        onSuccess: (updated) => {
          const next = updated.proposedAnswers[fieldKey];
          setDraft((prev) => ({ ...prev, [fieldKey]: next?.value ?? '' }));
        },
      },
    );
  };

  const sendReview = (action: 'approve' | 'reject' | 'retry') => {
    reviewMutation.mutate({ id: run.id, review: { action } });
  };

  const saveAnswers = () => {
    const edits = dirtyAnswerEdits(draft, run);
    if (Object.keys(edits).length === 0) return;
    reviewMutation.mutate({
      id: run.id,
      review: { action: 'edit', answers: edits },
    });
  };

  const approve = () => {
    const edits = dirtyAnswerEdits(draft, run);
    if (Object.keys(edits).length > 0) {
      reviewMutation.mutate(
        { id: run.id, review: { action: 'edit', answers: edits } },
        {
          onSuccess: () => {
            reviewMutation.mutate({
              id: run.id,
              review: { action: 'approve' },
            });
          },
        },
      );
      return;
    }
    sendReview('approve');
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            {messages.apply.reviewTitle}
          </Typography>
          <ApplyRunStatusChip status={run.status} />
          <Chip
            size="small"
            variant="outlined"
            label={messages.apply.providers[run.provider]}
          />
        </Stack>
        <Button component={RouterLink} to={routePaths.jobs} size="small">
          {messages.common.back}
        </Button>
      </Stack>

      <ApplyRunActions
        run={run}
        editable={editable}
        reviewable={reviewable}
        retryable={retryable}
        dirty={dirty}
        pending={pending}
        manualUrl={jobQuery.data?.url}
        onSave={saveAnswers}
        onApprove={approve}
        onReject={() => {
          sendReview('reject');
        }}
        onRetry={() => {
          sendReview('retry');
        }}
        onRedraft={redraft}
        redraftDisabled={dirty}
      />

      {run.error !== null && (
        <Alert severity="error">
          {messages.apply.review.runError}: {run.error}
        </Alert>
      )}
      {reviewMutation.isError && (
        <Alert severity="error">
          {reviewMutation.error instanceof Error
            ? reviewMutation.error.message
            : messages.common.error}
        </Alert>
      )}
      {redraftMutation.isError && (
        <Alert severity="error">
          {redraftMutation.error instanceof Error
            ? redraftMutation.error.message
            : messages.common.error}
        </Alert>
      )}

      <ApplyAnswersCard
        run={run}
        draft={draft}
        disabled={!editable || pending}
        onChange={(key, value) => {
          setDraft((prev) => ({ ...prev, [key]: value }));
        }}
        onRedraftField={editable ? redraftField : undefined}
      />

      <ApplyArtifactsCard runId={run.id} artifactNames={artifactNames} />

      {(run.status === 'ready_for_review' || run.status === 'needs_human') && (
        <ApplyTailoringCard
          jobId={run.jobId}
          applicationId={run.applicationId}
        />
      )}

      <ApplyRunOutcome run={run} />
    </Stack>
  );
}
