import { ToggleChip } from '@career-hub/ui/components';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import { formatJobSalary, isJobStale } from '../../services/jobMeta';
import type { Job } from '../../services/types/job';
import { useFilterStore } from '../../store/filterStore';
import { JobAgeBadge } from '../JobAgeBadge/JobAgeBadge';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

// Locations that merely restate the remote flag — showing them as a second
// chip would duplicate the "Remote" tag.
const REMOTE_LOCATION_VALUES = new Set([
  'remote',
  'remoto',
  'worldwide',
  'global',
  'anywhere',
]);

function isRedundantRemoteLocation(job: Job): boolean {
  return (
    job.remote && REMOTE_LOCATION_VALUES.has(job.location.trim().toLowerCase())
  );
}

function JobChips({ job }: { job: Job }) {
  const { messages } = useTranslation();
  const { level, area, remoteOnly, setLevel, setArea, setRemoteOnly } =
    useFilterStore();

  const levelLabel = messages.jobs.levels[job.level];
  const areaLabel = messages.jobs.areas[job.area];
  const sourceLabel = messages.jobs.sources[job.source];
  const remoteLabel = messages.jobs.remote;
  const levelActive = level === job.level;
  const areaActive = area === job.area;
  const remoteActive = job.remote && remoteOnly;

  // No tag may render twice: on a label collision the later entry wins, so
  // informational chips yield to the remote toggle (always last).
  const chipEntries: [string, string | null][] = [
    ['level', levelLabel],
    ['area', areaLabel],
    ['source', sourceLabel],
    ['location', job.location],
    ['remote', job.remote ? remoteLabel : null],
  ];
  const normalized = chipEntries.map(([, label]) =>
    (label ?? '').trim().toLowerCase(),
  );
  const hiddenChips = new Set(
    chipEntries
      .filter(
        (_, index) =>
          normalized[index] !== '' &&
          normalized.lastIndexOf(normalized[index] ?? '') !== index,
      )
      .map(([key]) => key),
  );

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {!hiddenChips.has('level') && (
          <ToggleChip
            label={levelLabel}
            active={levelActive}
            onToggle={() => {
              setLevel(levelActive ? undefined : job.level);
            }}
          />
        )}
        {!hiddenChips.has('area') && (
          <ToggleChip
            label={areaLabel}
            active={areaActive}
            onToggle={() => {
              setArea(areaActive ? undefined : job.area);
            }}
          />
        )}
        {!hiddenChips.has('source') && (
          <Chip label={sourceLabel} size="small" variant="outlined" />
        )}
        {!hiddenChips.has('location') && !isRedundantRemoteLocation(job) && (
          <Chip
            label={job.location}
            size="small"
            variant="outlined"
            sx={{ maxWidth: 220 }}
          />
        )}
        {job.remote && !hiddenChips.has('remote') && (
          <ToggleChip
            label={remoteLabel}
            active={remoteActive}
            onToggle={() => {
              setRemoteOnly(!remoteOnly);
            }}
          />
        )}
        {isJobStale(job) && (
          <Chip
            label={messages.jobs.possiblyExpired}
            size="small"
            variant="outlined"
            color="warning"
          />
        )}
        <Link
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          sx={{ alignSelf: 'center' }}
        >
          {messages.jobs.viewPosting}
        </Link>
      </Stack>
    </Box>
  );
}

export function JobCard({ job, onClick }: JobCardProps) {
  const salary = formatJobSalary(job);
  const meta = [salary, job.contractType].filter(Boolean).join(' · ');

  const details = (
    <CardContent>
      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Typography variant="h6" component="h3">
            {job.title}
          </Typography>
          <JobAgeBadge job={job} />
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          {job.company}
        </Typography>
        {meta !== '' && (
          <Typography variant="body2" color="text.secondary">
            {meta}
          </Typography>
        )}
      </Stack>
    </CardContent>
  );

  return (
    <Card>
      {onClick ? (
        <CardActionArea onClick={onClick}>{details}</CardActionArea>
      ) : (
        details
      )}
      <JobChips job={job} />
    </Card>
  );
}
