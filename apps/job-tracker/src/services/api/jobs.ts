import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Job, JobCreate, JobFilter, JobStats } from '../types/job';
import { apiClient } from './client';
import {
  jobResponseSchema,
  jobStatsResponseSchema,
  jobsResponseSchema,
} from './schemas';

const JOBS_QUERY_KEY = ['jobs'];
const JOB_STATS_QUERY_KEY = ['jobStats'];

export function useJobs(
  filter: JobFilter = {},
  options?: Omit<UseQueryOptions<Job[]>, 'queryKey' | 'queryFn'>,
) {
  const params = new URLSearchParams();
  if (filter.source) params.set('source', filter.source);
  if (filter.level) params.set('level', filter.level);
  if (filter.location) params.set('location', filter.location);
  if (filter.area) params.set('area', filter.area);
  if (filter.remoteOnly !== undefined)
    params.set('remoteOnly', String(filter.remoteOnly));
  if (filter.minMatchScore !== undefined)
    params.set('minMatchScore', String(filter.minMatchScore));
  if (filter.maxAgeDays !== undefined)
    params.set('maxAgeDays', String(filter.maxAgeDays));
  if (filter.sort) params.set('sort', filter.sort);
  if (filter.preset) params.set('preset', filter.preset);

  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, filter],
    queryFn: async () => {
      const response = await apiClient.get<unknown>(
        `/api/jobs?${params.toString()}`,
      );
      return jobsResponseSchema.parse(response.data).jobs;
    },
    ...options,
  });
}

export function useJob(
  id: number,
  options?: Omit<UseQueryOptions<Job>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<unknown>(`/api/jobs/${id}`);
      return jobResponseSchema.parse(response.data).job;
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
      const response = await apiClient.get<unknown>('/api/jobs/stats');
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
      const response = await apiClient.post<unknown>('/api/jobs', data);
      return jobResponseSchema.parse(response.data).job;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: JOB_STATS_QUERY_KEY });
    },
    ...options,
  });
}

export function useJobTitleById(): Map<number, string> {
  const { data: jobs } = useJobs();
  return new Map(jobs?.map((job) => [job.id, job.title]) ?? []);
}
