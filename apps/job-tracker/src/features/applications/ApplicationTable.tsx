import {
  Checkbox,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { ApplicationStatusChip } from '../../components/ApplicationStatusChip/ApplicationStatusChip';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import {
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationStatus,
} from '../../services/types/application';

interface ApplicationTableProps {
  applications: Application[];
  selected: ReadonlySet<number>;
  titleFor: (application: Application) => string;
  onToggleSelect: (id: number) => void;
  onRequestAdvance: (
    application: Application,
    target: ApplicationStatus,
  ) => void;
}

const EMPTY_CELL = '—';

export function ApplicationTable({
  applications,
  selected,
  titleFor,
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
      <Table stickyHeader size="small" sx={{ minWidth: 860 }}>
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
            <TableCell>{messages.applications.statusLabel}</TableCell>
            <TableCell>{messages.applications.appliedAt}</TableCell>
            <TableCell>{messages.applications.statusChangedAt}</TableCell>
            <TableCell>{messages.applications.notes}</TableCell>
            <TableCell>{messages.applications.moveTo}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => {
            const title = titleFor(app);
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
                  <Link
                    component={RouterLink}
                    to={routePaths.applicationDetail(app.id.toString())}
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    {title}
                  </Link>
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
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>{messages.applications.statusLabel}</InputLabel>
                    <Select
                      label={messages.applications.statusLabel}
                      value={app.status}
                      onChange={(e) => {
                        onRequestAdvance(app, e.target.value);
                      }}
                    >
                      {APPLICATION_STATUS_ORDER.map((status) => (
                        <MenuItem key={status} value={status}>
                          {messages.applications.status[status]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
