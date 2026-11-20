import {
  Alert,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  EmptyState,
  QueryGate,
  SkeletonGrid,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useApplicationTracker } from '../../services/api/applications';
import {
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationStatus,
  type ApplicationUpdate,
  TERMINAL_APPLICATION_STATUSES,
} from '../../services/types/application';
import { AdvanceApplicationDialog } from './AdvanceApplicationDialog';
import { ApplicationBoard } from './ApplicationBoard';
import { ApplicationCard } from './ApplicationCard';
import { buildAdvanceUpdate } from './applicationActions';
import {
  exportApplicationsCsv,
  exportApplicationsJson,
} from './exportApplications';

interface PendingAdvance {
  applications: Application[];
  target: ApplicationStatus;
}

interface UndoEntry {
  id: number;
  data: ApplicationUpdate;
}

function dialogTitle(
  pending: PendingAdvance | null,
  titleFor: (app: Application) => string,
): string {
  if (pending === null) return '';
  if (pending.applications.length === 1) {
    const first = pending.applications[0];
    return first === undefined ? '' : titleFor(first);
  }
  return `${pending.applications.length} applications`;
}

export function ApplicationList() {
  const { messages } = useTranslation();
  const { applicationsQuery, updateApplication, jobTitleById, titleForJob } =
    useApplicationTracker(messages.applications.jobFallback);
  const { mutateAsync } = updateApplication;

  const [view, setView] = useState<'list' | 'board'>('list');
  const [selected, setSelected] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [bulkTarget, setBulkTarget] = useState<ApplicationStatus>('applied');
  const [pendingAdvance, setPendingAdvance] = useState<PendingAdvance | null>(
    null,
  );
  const [undoEntries, setUndoEntries] = useState<UndoEntry[] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const titleFor = (app: Application) => titleForJob(app.jobId);

  const requestAdvance = (apps: Application[], target: ApplicationStatus) => {
    const actionable = apps.filter((app) => app.status !== target);
    if (actionable.length === 0) return;
    if (TERMINAL_APPLICATION_STATUSES.has(target)) {
      setPendingAdvance({ applications: actionable, target });
    } else {
      void runAdvance(actionable, target);
    }
  };

  const runAdvance = async (
    apps: Application[],
    target: ApplicationStatus,
    reason?: string,
  ) => {
    const snapshots: UndoEntry[] = [];
    let succeeded = 0;
    try {
      for (const app of apps) {
        const data = buildAdvanceUpdate(app, target, { reason });
        if (data === null) continue;
        await mutateAsync({ id: app.id, data });
        snapshots.push({
          id: app.id,
          data: {
            status: app.status,
            appliedAt: app.appliedAt,
            notes: app.notes,
          },
        });
        succeeded += 1;
      }
    } catch {
      setActionError(messages.common.error);
    }
    if (succeeded > 0) {
      setUndoEntries(snapshots);
      setSelected(new Set());
    }
  };

  const runUndo = async () => {
    const entries = undoEntries ?? [];
    setUndoEntries(null);
    try {
      for (const entry of entries) {
        await mutateAsync({ id: entry.id, data: entry.data });
      }
    } catch {
      setActionError(messages.common.error);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedApps = (applications: Application[]) =>
    applications.filter((app) => selected.has(app.id));

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
      >
        <Typography component="h1" variant="h5" sx={{ flexGrow: 1 }}>
          {messages.applications.title}
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, next: 'list' | 'board' | null) => {
            if (next !== null) setView(next);
          }}
        >
          <ToggleButton value="list">
            {messages.applications.viewList}
          </ToggleButton>
          <ToggleButton value="board">
            {messages.applications.viewBoard}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {actionError !== null && (
        <Alert
          severity="error"
          onClose={() => {
            setActionError(null);
          }}
        >
          {actionError}
        </Alert>
      )}

      <QueryGate
        query={applicationsQuery}
        subject={messages.applications.title}
        isEmpty={(page) => page.applications.length === 0}
        empty={<EmptyState title={messages.applications.noApplications} />}
        loading={<SkeletonGrid variant="card" count={4} />}
      >
        {(page) => {
          const applications = page.applications;
          const selectedAppsList = selectedApps(applications);

          return (
            <Stack spacing={2}>
              <Stack
                direction="row"
                sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
              >
                <Typography component="h2" variant="h6">
                  {messages.applications.title} ({page.total})
                </Typography>
                <Stack
                  direction="row"
                  sx={{ gap: 1, marginInlineStart: 'auto' }}
                >
                  {selectedAppsList.length > 0 && view === 'list' && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {messages.applications.selectedCount.replace(
                          '{count}',
                          String(selectedAppsList.length),
                        )}
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>
                          {messages.applications.statusLabel}
                        </InputLabel>
                        <Select
                          label={messages.applications.statusLabel}
                          value={bulkTarget}
                          onChange={(e) => {
                            setBulkTarget(e.target.value);
                          }}
                        >
                          {APPLICATION_STATUS_ORDER.map((status) => (
                            <MenuItem key={status} value={status}>
                              {messages.applications.status[status]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          requestAdvance(selectedAppsList, bulkTarget);
                        }}
                      >
                        {messages.applications.moveSelected}
                      </Button>
                    </>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      exportApplicationsCsv(applications, jobTitleById);
                    }}
                  >
                    {messages.applications.exportCsv}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      exportApplicationsJson(applications);
                    }}
                  >
                    {messages.applications.exportJson}
                  </Button>
                </Stack>
              </Stack>

              {view === 'board' ? (
                <ApplicationBoard
                  applications={applications}
                  onMove={(app, target) => {
                    requestAdvance([app], target);
                  }}
                />
              ) : (
                <Grid container spacing={2}>
                  {applications.map((app) => (
                    <Grid size={{ xs: 12, md: 6 }} key={app.id}>
                      <ApplicationCard
                        application={app}
                        title={titleFor(app)}
                        selected={selected.has(app.id)}
                        onToggleSelect={toggleSelect}
                        onRequestAdvance={(application, target) => {
                          requestAdvance([application], target);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          );
        }}
      </QueryGate>

      <AdvanceApplicationDialog
        open={pendingAdvance !== null}
        title={dialogTitle(pendingAdvance, titleFor)}
        target={pendingAdvance?.target ?? 'rejected'}
        onConfirm={(reason) => {
          const pending = pendingAdvance;
          setPendingAdvance(null);
          if (pending !== null) {
            void runAdvance(pending.applications, pending.target, reason);
          }
        }}
        onCancel={() => {
          setPendingAdvance(null);
        }}
      />

      <Snackbar
        open={undoEntries !== null}
        onClose={() => {
          setUndoEntries(null);
        }}
        message={messages.common.saved}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              void runUndo();
            }}
          >
            {messages.common.undo}
          </Button>
        }
      />
    </Stack>
  );
}
