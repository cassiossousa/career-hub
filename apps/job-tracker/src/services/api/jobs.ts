import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { jobMatchesSearch } from '../jobMeta';
import type {
  Job,
  JobCreate,
  JobFilter,
  JobListPage,
  JobStats,
} from '../types/job';
import { apiClient } from './client';
import { paginationParams } from './pagination';
import {
  jobResponseSchema,
  jobStatsResponseSchema,
  jobsResponseSchema,
} from './schemas';

export const JOBS_PAGE_SIZE = 200;

export const JOBS_QUERY_KEY = ['jobs'];
export const JOB_STATS_QUERY_KEY = ['jobStats'];

export interface JobsQueryOptions {
  limit?: number | undefined;
  offset?: number | undefined;
}

export function useJobs(
  filter: JobFilter = {},
  options?: Omit<UseQueryOptions<JobListPage>, 'queryKey' | 'queryFn'> &
    JobsQueryOptions,
) {
  const { limit = JOBS_PAGE_SIZE, offset = 0, ...queryOptions } = options ?? {};
  const params = paginationParams(limit, offset);
  if (filter.source) params.set('source', filter.source);
  if (filter.level) params.set('level', filter.level);
  if (filter.location) params.set('location', filter.location);
  if (filter.area) params.set('area', filter.area);
  if (filter.remoteOnly !== undefined)
    params.set('remoteOnly', String(filter.remoteOnly));
  if (filter.maxAgeDays !== undefined)
    params.set('maxAgeDays', String(filter.maxAgeDays));
  if (filter.preset) params.set('preset', filter.preset);

  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, filter, limit, offset],
    queryFn: async () => {
      const response = await apiClient.get(`/api/jobs?${params.toString()}`);
      return jobsResponseSchema.parse(response.data);
    },
    ...queryOptions,
  });
}

export function useJob(
  id: number,
  options?: Omit<UseQueryOptions<Job>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/jobs/${id}`);
      return jobResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useJobStats(
  options?: Omit<UseQueryOptions<JobStats>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: JOB_STATS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get('/api/jobs/stats');
      return jobStatsResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useCreateJob(
  options?: Omit<UseMutationOptions<Job, Error, JobCreate>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JobCreate) => {
      const response = await apiClient.post('/api/jobs', data);
      return jobResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: JOB_STATS_QUERY_KEY });
    },
    ...options,
  });
}

export interface JobSummary {
  title: string;
  company: string;
}

export function useJobSummaries(): Map<number, JobSummary> {
  const { data } = useJobs();
  return useMemo(
    () =>
      new Map(
        data?.jobs.map((job) => [
          job.id,
          { title: job.title, company: job.company },
        ]) ?? [],
      ),
    [data],
  );
}

/** Client-side title/company/location search over a fetched job page. */
export function useVisibleJobs(
  jobs: JobListPage['jobs'] | undefined,
  search: string | undefined,
): Job[] | undefined {
  const query = search?.trim().toLowerCase() ?? '';
  return useMemo(
    () => jobs?.filter((job) => jobMatchesSearch(job, query)),
    [jobs, query],
  );
}
