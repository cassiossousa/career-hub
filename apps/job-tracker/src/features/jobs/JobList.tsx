import { Button, Grid, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import {
  EmptyState,
  QueryGate,
  SkeletonGrid,
} from '../../components/AsyncStatus/AsyncStatus';
import { FilterBar } from '../../components/FilterBar/FilterBar';
import { JobCard } from '../../components/JobCard/JobCard';
import { useTranslation } from '../../i18n/Provider';
import { useJobs } from '../../services/api/jobs';
import { jobMatchesSearch } from '../../services/jobMeta';
import { useFilterStore } from '../../store/filterStore';

export function JobList() {
  const navigate = useNavigate();
  const { messages } = useTranslation();
  const {
    level,
    location,
    area,
    remoteOnly,
    maxAgeDays,
    preset,
    search,
    resetFilters,
  } = useFilterStore();

  const hasActiveFilters = [
    level,
    location,
    area,
    remoteOnly,
    maxAgeDays !== undefined,
    preset,
    search,
  ].some(Boolean);

  const jobsQuery = useJobs({
    level,
    location,
    area,
    remoteOnly: remoteOnly || undefined,
    maxAgeDays,
    preset,
  });

  const query = search?.trim().toLowerCase() ?? '';
  const visibleJobs = useMemo(
    () => jobsQuery.data?.jobs.filter((job) => jobMatchesSearch(job, query)),
    [jobsQuery.data, query],
  );

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
    <Stack spacing={2}>
      <Typography component="h1" variant="h5">
        {messages.jobs.title}
      </Typography>
      <FilterBar />
      <QueryGate
        query={jobsQuery}
        subject={messages.jobs.title}
        isEmpty={(page) => page.jobs.length === 0}
        empty={emptyState}
        loading={<SkeletonGrid variant="card" count={6} />}
      >
        {(page) =>
          visibleJobs !== undefined && visibleJobs.length === 0 ? (
            emptyState
          ) : (
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                {messages.jobs.title} ({visibleJobs?.length ?? page.total})
              </Typography>
              <Grid container spacing={2}>
                {(visibleJobs ?? page.jobs).map((job) => (
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
          )
        }
      </QueryGate>
    </Stack>
  );
}
