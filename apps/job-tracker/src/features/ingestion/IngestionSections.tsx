import { ToggleChip } from '@career-hub/ui/components';
import {
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { EmptyState } from '../../components/AsyncStatus/AsyncStatus';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import { useJobStats } from '../../services/api/jobs';
import { JOB_SOURCES } from '../../services/jobOptions';
import type {
  IngestionRun,
  IngestionRunStatus,
} from '../../services/types/ingestion';
import type { JobSource } from '../../services/types/job';

const STATUS_COLORS: Record<
  IngestionRunStatus,
  'success' | 'warning' | 'error'
> = {
  succeeded: 'success',
  partial: 'warning',
  failed: 'error',
};

function formatTimestamp(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale);
}

interface SourceCountsProps {
  selectedSource: JobSource | null;
  onSourceChange: (source: JobSource | null) => void;
}

export function SourceCounts({
  selectedSource,
  onSourceChange,
}: SourceCountsProps) {
  const { messages } = useTranslation();
  const statsQuery = useJobStats();
  const bySource = statsQuery.data?.bySource ?? {};

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">
        {messages.ingestion.jobsBySource}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {JOB_SOURCES.map((source) => {
          const active = selectedSource === source;
          return (
            <ToggleChip
              key={source}
              label={`${messages.jobs.sources[source]}: ${bySource[source] ?? 0}`}
              active={active}
              onToggle={() => {
                onSourceChange(active ? null : source);
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}

interface RunsTableProps {
  runs: IngestionRun[];
  sourceFilter: JobSource | null;
  onClearSourceFilter: () => void;
}

export function RunsTable({
  runs,
  sourceFilter,
  onClearSourceFilter,
}: RunsTableProps) {
  const { messages, locale } = useTranslation();
  const t = messages.ingestion;

  if (runs.length === 0) {
    return <EmptyState title={t.noRuns} />;
  }

  const visibleRuns =
    sourceFilter === null
      ? runs
      : runs.filter((run) => run.source === sourceFilter);

  if (visibleRuns.length === 0 && sourceFilter !== null) {
    return (
      <EmptyState
        title={interpolate(t.noRunsForSource, {
          source: messages.jobs.sources[sourceFilter],
        })}
        action={
          <Button variant="outlined" size="small" onClick={onClearSourceFilter}>
            {t.showAllSources}
          </Button>
        }
      />
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t.columns.started}</TableCell>
            <TableCell>{t.columns.source}</TableCell>
            <TableCell>{t.columns.status}</TableCell>
            <TableCell align="right">{t.columns.fetched}</TableCell>
            <TableCell align="right">{t.columns.inserted}</TableCell>
            <TableCell align="right">{t.columns.updated}</TableCell>
            <TableCell align="right">{t.columns.failed}</TableCell>
            <TableCell>{t.columns.error}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRuns.map((run) => (
            <TableRow key={run.id}>
              <TableCell>{formatTimestamp(run.startedAt, locale)}</TableCell>
              <TableCell>{messages.jobs.sources[run.source]}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={STATUS_COLORS[run.status]}
                  label={t.status[run.status]}
                />
              </TableCell>
              <TableCell align="right">{run.fetched}</TableCell>
              <TableCell align="right">{run.inserted}</TableCell>
              <TableCell align="right">{run.updated}</TableCell>
              <TableCell align="right">{run.failed}</TableCell>
              <TableCell
                sx={{
                  maxWidth: 280,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {run.error ?? ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
