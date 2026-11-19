import { Button, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import {
  EmptyState,
  QueryGate,
} from '../../components/AsyncStatus/AsyncStatus';
import { JobCard } from '../../components/JobCard/JobCard';
import { useTranslation } from '../../i18n/Provider';
import { useJobs } from '../../services/api/jobs';
import { useFilterStore } from '../../store/filterStore';

export function JobList() {
  const navigate = useNavigate();
  const { messages } = useTranslation();
  const {
    level,
    location,
    area,
    remoteOnly,
    minMatchScore,
    maxAgeDays,
    sort,
    preset,
    resetFilters,
  } = useFilterStore();

  const hasActiveFilters = [
    level,
    location,
    area,
    remoteOnly,
    minMatchScore !== undefined,
    maxAgeDays !== undefined,
    preset,
  ].some(Boolean);

  const jobsQuery = useJobs({
    level,
    location,
    area,
    remoteOnly: remoteOnly || undefined,
    minMatchScore,
    maxAgeDays,
    sort,
    preset,
  });

  const emptyState = hasActiveFilters ? (
    <EmptyState
      title={messages.jobs.noJobsMatching}
      action={
        <Button variant="outlined" size="small" onClick={resetFilters}>
          {messages.jobs.clearFilters}
        </Button>
      }
    />
  ) : (
    <EmptyState title={messages.jobs.noJobs} />
  );

  return (
    <QueryGate
      query={jobsQuery}
      subject={messages.jobs.title}
      isEmpty={(jobs) => jobs.length === 0}
      empty={emptyState}
    >
      {(jobs) => (
        <Stack spacing={2}>
          <Typography variant="h5">
            {messages.jobs.title} ({jobs.length})
          </Typography>
          <Grid container spacing={2}>
            {jobs.map((job) => (
              <Grid size={{ xs: 12, md: 6 }} key={job.id}>
                <JobCard
                  job={job}
                  onClick={() => {
                    void navigate(routePaths.jobDetail(job.id.toString()));
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
    </QueryGate>
  );
}
