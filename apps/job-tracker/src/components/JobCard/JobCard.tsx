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
import { JobAgeBadge } from '../JobAgeBadge/JobAgeBadge';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const { messages } = useTranslation();
  const matchScoreColor =
    job.matchScore !== null && job.matchScore >= 80
      ? 'success'
      : job.matchScore !== null && job.matchScore >= 50
        ? 'warning'
        : 'default';

  const content = (
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
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={messages.jobs.levels[job.level]}
            size="small"
            variant="outlined"
          />
          <Chip
            label={messages.jobs.areas[job.area]}
            size="small"
            variant="outlined"
          />
          <Chip label={job.location} size="small" variant="outlined" />
          {job.remote && (
            <Chip
              label={messages.jobs.remote}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
        {job.matchScore !== null && (
          <Typography variant="body2" color={`${matchScoreColor}.main`}>
            {messages.jobs.matchScore}: {job.matchScore}%
          </Typography>
        )}
      </Stack>
    </CardContent>
  );

  return (
    <Card>
      {onClick ? (
        <CardActionArea onClick={onClick}>{content}</CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
