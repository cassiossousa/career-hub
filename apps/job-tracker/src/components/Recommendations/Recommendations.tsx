import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { useTranslation } from '../../i18n/Provider';
import { useJobs } from '../../services/api/jobs';
import {
  EmptyState,
  QueryGate,
  SkeletonGrid,
} from '../AsyncStatus/AsyncStatus';
import { JobCard } from '../JobCard/JobCard';

export function Recommendations() {
  const { messages } = useTranslation();
  const jobsQuery = useJobs({ preset: 'profile' });

  return (
    <QueryGate
      query={jobsQuery}
      subject={messages.dashboard.recommendations.title}
      isEmpty={(page) => page.jobs.length === 0}
      empty={
        <EmptyState
          title={messages.dashboard.recommendations.noRecommendations}
        />
      }
      loading={<SkeletonGrid variant="row" count={3} />}
    >
      {(page) => (
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            {messages.dashboard.recommendations.title}
          </Typography>
          <Stack spacing={2}>
            {page.jobs.slice(0, 5).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </Stack>
          <Button
            component={RouterLink}
            to={routePaths.jobs}
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            {messages.dashboard.recommendations.viewAll}
          </Button>
        </Stack>
      )}
    </QueryGate>
  );
}
