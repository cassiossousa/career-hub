import {
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { ApplyRunStatusChip } from '../../components/ApplyRunStatusChip/ApplyRunStatusChip';
import {
  EmptyState,
  QueryGate,
} from '../../components/AsyncStatus/AsyncStatus';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import { useApplyRuns } from '../../services/api/applyRuns';
import { useJobSummaries } from '../../services/api/jobs';
import {
  APPLY_RUN_STATUSES,
  type ApplyRunStatus,
} from '../../services/types/applyRun';

const ALL_STATUSES = 'all';
type StatusFilter = ApplyRunStatus | typeof ALL_STATUSES;

function isApplyRunStatus(value: string): value is ApplyRunStatus {
  return (APPLY_RUN_STATUSES as readonly string[]).includes(value);
}

export function ApplyQueue() {
  const { locale, messages } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUSES);
  const status = isApplyRunStatus(statusFilter) ? statusFilter : undefined;
  const runsQuery = useApplyRuns({ status });
  const jobSummaries = useJobSummaries();

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography component="h1" variant="h5">
          {messages.apply.title}
        </Typography>
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => {
            const next = e.target.value;
            setStatusFilter(
              next === ALL_STATUSES || isApplyRunStatus(next)
                ? next
                : ALL_STATUSES,
            );
          }}
          sx={{ minWidth: 200 }}
          aria-label={messages.apply.columns.status}
        >
          <MenuItem value={ALL_STATUSES}>{messages.apply.allStatuses}</MenuItem>
          {APPLY_RUN_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {messages.apply.status[s]}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <QueryGate
        query={runsQuery}
        subject={messages.apply.title}
        isEmpty={(page) => page.runs.length === 0}
        empty={<EmptyState title={messages.apply.empty} />}
      >
        {(page) => (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{messages.apply.columns.job}</TableCell>
                  <TableCell>{messages.apply.columns.company}</TableCell>
                  <TableCell>{messages.apply.columns.provider}</TableCell>
                  <TableCell>{messages.apply.columns.status}</TableCell>
                  <TableCell>{messages.apply.columns.attempt}</TableCell>
                  <TableCell>{messages.apply.columns.updated}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.runs.map((run) => {
                  const summary = jobSummaries.get(run.jobId);
                  return (
                    <TableRow key={run.id} hover>
                      <TableCell>
                        <RouterLink to={routePaths.applyRun(String(run.id))}>
                          {summary?.title ??
                            interpolate(messages.applications.jobFallback, {
                              id: String(run.jobId),
                            })}
                        </RouterLink>
                      </TableCell>
                      <TableCell>{summary?.company ?? '—'}</TableCell>
                      <TableCell>
                        {messages.apply.providers[run.provider]}
                      </TableCell>
                      <TableCell>
                        <ApplyRunStatusChip status={run.status} />
                      </TableCell>
                      <TableCell>{run.attempt}</TableCell>
                      <TableCell>
                        {new Date(run.updatedAt).toLocaleString(locale)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </QueryGate>
    </Stack>
  );
}
