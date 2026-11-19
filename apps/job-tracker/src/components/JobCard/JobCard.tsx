import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type { Job } from '../../services/types/job';
import { useFilterStore } from '../../store/filterStore';
import { JobAgeBadge } from '../JobAgeBadge/JobAgeBadge';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

function matchScoreColor(
  score: number | null,
): 'success' | 'warning' | 'default' {
  if (score === null) return 'default';
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'default';
}

function JobChips({ job }: { job: Job }) {
  const { messages } = useTranslation();
  const { level, area, remoteOnly, setLevel, setArea, setRemoteOnly } =
    useFilterStore();

  const levelActive = level === job.level;
  const areaActive = area === job.area;
  const remoteActive = job.remote && remoteOnly;

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label={messages.jobs.levels[job.level]}
          size="small"
          variant={levelActive ? 'filled' : 'outlined'}
          color={levelActive ? 'primary' : 'default'}
          clickable
          aria-pressed={levelActive}
          onClick={() => {
            setLevel(levelActive ? undefined : job.level);
          }}
        />
        <Chip
          label={messages.jobs.areas[job.area]}
          size="small"
          variant={areaActive ? 'filled' : 'outlined'}
          color={areaActive ? 'primary' : 'default'}
          clickable
          aria-pressed={areaActive}
          onClick={() => {
            setArea(areaActive ? undefined : job.area);
          }}
        />
        <Chip
          label={messages.jobs.sources[job.source]}
          size="small"
          variant="outlined"
        />
        <Chip
          label={job.location}
          size="small"
          variant="outlined"
          sx={{ maxWidth: 220 }}
        />
        {job.remote && (
          <Chip
            label={messages.jobs.remote}
            size="small"
            variant={remoteActive ? 'filled' : 'outlined'}
            color={remoteActive ? 'primary' : 'default'}
            clickable
            aria-pressed={remoteActive}
            onClick={() => {
              setRemoteOnly(!remoteOnly);
            }}
          />
        )}
      </Stack>
    </Box>
  );
}

export function JobCard({ job, onClick }: JobCardProps) {
  const { messages } = useTranslation();

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
        {job.matchScore !== null && (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box
              aria-hidden="true"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: `${matchScoreColor(job.matchScore)}.main`,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2">
              {messages.jobs.matchScore}: {job.matchScore}%
            </Typography>
          </Stack>
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
