import { Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { ApplicationStatusChip } from '../../components/ApplicationStatusChip/ApplicationStatusChip';
import { ApplicationStatusSelect } from '../../components/ApplicationStatusSelect/ApplicationStatusSelect';
import { ApplyRunStatusChip } from '../../components/ApplyRunStatusChip/ApplyRunStatusChip';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import { useUpdateApplication } from '../../services/api/applications';
import { useLatestApplyRun } from '../../services/api/applyRuns';
import { useJobSummaries } from '../../services/api/jobs';
import {
  type Application,
  type ApplicationStatus,
  type ApplicationUpdate,
  TERMINAL_APPLICATION_STATUSES,
} from '../../services/types/application';
import { AdvanceApplicationDialog } from './AdvanceApplicationDialog';
import { buildAdvanceUpdate } from './applicationActions';
import { JobDetailLink } from './EntityLinks';
import { NotesTextField } from './NotesTextField';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateTimeLocal(iso: string | null): string {
  if (iso === null) return '';
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function HubOverview({ application }: { application: Application }) {
  const { locale, messages } = useTranslation();
  const jobSummaries = useJobSummaries();
  const latestRunQuery = useLatestApplyRun(application.id);
  const latestRun = latestRunQuery.data?.runs[0];
  const updateMutation = useUpdateApplication();
  const [pendingTarget, setPendingTarget] = useState<ApplicationStatus | null>(
    null,
  );
  const [notesDraft, setNotesDraft] = useState(application.notes ?? '');
  const [followUpDraft, setFollowUpDraft] = useState(() =>
    toDateTimeLocal(application.followUpAt),
  );
  const [savedFlash, setSavedFlash] = useState(false);

  const summary = jobSummaries.get(application.jobId) ?? null;
  const title =
    summary?.title ??
    interpolate(messages.applications.jobFallback, {
      id: String(application.jobId),
    });

  const applyUpdate = (data: ApplicationUpdate) => {
    updateMutation.mutate(
      { id: application.id, data },
      {
        onSuccess: () => {
          setSavedFlash(true);
        },
      },
    );
  };

  const requestStatus = (target: ApplicationStatus) => {
    if (target === application.status) return;
    if (TERMINAL_APPLICATION_STATUSES.has(target)) {
      setPendingTarget(target);
      return;
    }
    const data = buildAdvanceUpdate(application, target);
    if (data !== null) applyUpdate(data);
  };

  const draftFollowUpMs =
    followUpDraft === '' ? null : new Date(followUpDraft).getTime();
  const savedFollowUpMs =
    application.followUpAt === null
      ? null
      : new Date(application.followUpAt).getTime();

  const saveNotesAndFollowUp = () => {
    const trimmed = notesDraft.trim();
    const data: ApplicationUpdate = {};
    if (trimmed !== (application.notes ?? '')) {
      data.notes = trimmed === '' ? null : trimmed;
    }
    if (draftFollowUpMs !== savedFollowUpMs) {
      data.followUpAt =
        draftFollowUpMs === null
          ? null
          : new Date(draftFollowUpMs).toISOString();
    }
    if (Object.keys(data).length > 0) applyUpdate(data);
  };

  const dirty =
    notesDraft.trim() !== (application.notes ?? '') ||
    draftFollowUpMs !== savedFollowUpMs;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h6">
          <JobDetailLink jobId={application.jobId}>{title}</JobDetailLink>
        </Typography>
        {summary !== null && (
          <Typography variant="body2" color="text.secondary">
            {messages.applicationHub.overview.company}: {summary.company}
          </Typography>
        )}
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <ApplicationStatusChip status={application.status} />
          {application.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
        {latestRun !== undefined && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {messages.apply.review.latestRun}:
            </Typography>
            <ApplyRunStatusChip status={latestRun.status} />
            <RouterLink to={routePaths.applyRun(String(latestRun.id))}>
              {messages.apply.review.viewRun}
            </RouterLink>
          </Stack>
        )}
      </Stack>

      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <ApplicationStatusSelect
          value={application.status}
          sx={{ maxWidth: 240 }}
          onChange={requestStatus}
        />

        <TextField
          size="small"
          type="datetime-local"
          label={messages.applicationHub.overview.followUp}
          helperText={messages.applicationHub.overview.followUpHint}
          value={followUpDraft}
          onChange={(e) => {
            setFollowUpDraft(e.target.value);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <NotesTextField
          minRows={3}
          label={messages.applicationHub.overview.notes}
          value={notesDraft}
          onChange={setNotesDraft}
        />

        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            size="small"
            disabled={!dirty || updateMutation.isPending}
            onClick={saveNotesAndFollowUp}
          >
            {messages.applicationHub.overview.save}
          </Button>
          {savedFlash && (
            <Typography variant="body2" color="text.secondary">
              {messages.common.saved}
            </Typography>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {messages.applicationHub.overview.appliedAt}:{' '}
          {application.appliedAt === null
            ? '—'
            : new Date(application.appliedAt).toLocaleDateString(locale)}
          {' · '}
          {messages.applicationHub.overview.statusChangedAt}:{' '}
          {new Date(application.statusChangedAt).toLocaleString(locale)}
        </Typography>
      </Stack>

      <AdvanceApplicationDialog
        open={pendingTarget !== null}
        title={title}
        target={pendingTarget ?? 'rejected'}
        onConfirm={(reason) => {
          const target = pendingTarget;
          setPendingTarget(null);
          if (target === null) return;
          const data = buildAdvanceUpdate(application, target, { reason });
          if (data !== null) applyUpdate(data);
        }}
        onCancel={() => {
          setPendingTarget(null);
        }}
      />
    </Stack>
  );
}
