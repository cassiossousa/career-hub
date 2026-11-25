import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ApplicationStatusChip } from '../../components/ApplicationStatusChip/ApplicationStatusChip';
import { ApplicationStatusSelect } from '../../components/ApplicationStatusSelect/ApplicationStatusSelect';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import type { JobSummary } from '../../services/api/jobs';
import {
  type Application,
  type ApplicationStatus,
  TERMINAL_APPLICATION_STATUSES,
} from '../../services/types/application';
import { ApplicationDetailLink, JobDetailLink } from './EntityLinks';

interface ApplicationTableProps {
  applications: Application[];
  selected: ReadonlySet<number>;
  titleFor: (application: Application) => string;
  summaryForJob: (jobId: number) => JobSummary | null;
  onToggleSelect: (id: number) => void;
  onRequestAdvance: (
    application: Application,
    target: ApplicationStatus,
  ) => void;
}

const EMPTY_CELL = '—';

const renderedAtMs = Date.now();

function isFollowUpOverdue(application: Application): boolean {
  return (
    application.followUpAt != null &&
    new Date(application.followUpAt).getTime() <= renderedAtMs &&
    !TERMINAL_APPLICATION_STATUSES.has(application.status)
  );
}

export function ApplicationTable({
  applications,
  selected,
  titleFor,
  summaryForJob,
  onToggleSelect,
  onRequestAdvance,
}: ApplicationTableProps) {
  const { locale, messages } = useTranslation();

  const allSelected =
    applications.length > 0 &&
    applications.every((app) => selected.has(app.id));
  const someSelected = applications.some((app) => selected.has(app.id));

  const toggleAll = () => {
    for (const app of applications) {
      if (allSelected ? selected.has(app.id) : !selected.has(app.id)) {
        onToggleSelect(app.id);
      }
    }
  };

  return (
    <TableContainer sx={{ maxHeight: '70vh' }}>
      <Table stickyHeader size="small" sx={{ minWidth: 980 }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={toggleAll}
                slotProps={{
                  input: { 'aria-label': messages.applications.selectAll },
                }}
              />
            </TableCell>
            <TableCell>{messages.applications.jobColumn}</TableCell>
            <TableCell>{messages.applications.company}</TableCell>
            <TableCell>{messages.applications.statusLabel}</TableCell>
            <TableCell>{messages.applications.appliedAt}</TableCell>
            <TableCell>{messages.applications.followUp}</TableCell>
            <TableCell>{messages.applications.statusChangedAt}</TableCell>
            <TableCell>{messages.applications.notes}</TableCell>
            <TableCell>{messages.applications.moveTo}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => {
            const title = titleFor(app);
            const summary = summaryForJob(app.jobId);
            const overdue = isFollowUpOverdue(app);
            return (
              <TableRow key={app.id} hover selected={selected.has(app.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.has(app.id)}
                    onChange={() => {
                      onToggleSelect(app.id);
                    }}
                    slotProps={{
                      input: {
                        'aria-label': interpolate(
                          messages.applications.selectRow,
                          { title },
                        ),
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <ApplicationDetailLink
                    applicationId={app.id}
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    {title}
                  </ApplicationDetailLink>
                </TableCell>
                <TableCell>
                  {summary === null ? (
                    <Typography variant="body2" color="text.secondary">
                      {EMPTY_CELL}
                    </Typography>
                  ) : (
                    <JobDetailLink jobId={app.jobId} variant="body2">
                      {summary.company}
                    </JobDetailLink>
                  )}
                </TableCell>
                <TableCell>
                  <ApplicationStatusChip status={app.status} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {app.appliedAt === null
                      ? EMPTY_CELL
                      : new Date(app.appliedAt).toLocaleDateString(locale)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={overdue ? 'warning.main' : 'text.primary'}
                  >
                    {app.followUpAt === null
                      ? EMPTY_CELL
                      : new Date(app.followUpAt).toLocaleDateString(locale)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(app.statusChangedAt).toLocaleDateString(locale)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 220 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {app.notes ?? EMPTY_CELL}
                  </Typography>
                </TableCell>
                <TableCell>
                  <ApplicationStatusSelect
                    value={app.status}
                    sx={{ minWidth: 130 }}
                    onChange={(status) => {
                      onRequestAdvance(app, status);
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
