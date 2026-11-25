import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { interpolate } from '../../i18n/interpolate';
import type {
  Application,
  ApplicationCreate,
  ApplicationEventListPage,
  ApplicationListPage,
  ApplicationUpdate,
} from '../types/application';
import { apiClient } from './client';
import { JOBS_PAGE_SIZE, type JobSummary, useJobSummaries } from './jobs';
import {
  applicationEventsResponseSchema,
  applicationResponseSchema,
  applicationsResponseSchema,
} from './schemas';

const APPLICATIONS_QUERY_KEY = ['applications'];

export interface ApplicationsQueryFilter {
  status?: string | undefined;
  jobId?: number | undefined;
  followUp?: 'due' | 'upcoming' | undefined;
  tag?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export function useApplications(
  filter: ApplicationsQueryFilter = {},
  options?: Omit<UseQueryOptions<ApplicationListPage>, 'queryKey' | 'queryFn'>,
) {
  const {
    limit = JOBS_PAGE_SIZE,
    offset = 0,
    status,
    jobId,
    followUp,
    tag,
  } = filter;
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (status) params.set('status', status);
  if (jobId) params.set('jobId', String(jobId));
  if (followUp) params.set('followUp', followUp);
  if (tag) params.set('tag', tag);

  return useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, filter],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/applications?${params.toString()}`,
      );
      return applicationsResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useApplication(
  id: number,
  options?: Omit<UseQueryOptions<Application>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/applications/${id}`);
      return applicationResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useApplicationEvents(
  applicationId: number,
  options?: Omit<
    UseQueryOptions<ApplicationEventListPage>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, applicationId, 'events'],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/applications/${applicationId}/events`,
      );
      return applicationEventsResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useCreateApplication(
  options?: Omit<
    UseMutationOptions<Application, Error, ApplicationCreate>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplicationCreate) => {
      const response = await apiClient.post('/api/applications', data);
      return applicationResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: APPLICATIONS_QUERY_KEY,
      });
    },
    ...options,
  });
}

export function useUpdateApplication(
  options?: Omit<
    UseMutationOptions<
      Application,
      Error,
      { id: number; data: ApplicationUpdate }
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: ApplicationUpdate;
    }) => {
      const response = await apiClient.patch(`/api/applications/${id}`, data);
      return applicationResponseSchema.parse(response.data);
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: APPLICATIONS_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: [...APPLICATIONS_QUERY_KEY, id],
      });
    },
    ...options,
  });
}

/**
 * Bundles the applications list query, the update mutation, and job-title
 * resolution (with a localized fallback) for tracker views.
 */
export function useApplicationTracker(
  fallbackTemplate: string,
  filter: ApplicationsQueryFilter = {},
) {
  const applicationsQuery = useApplications(filter);
  const updateApplication = useUpdateApplication();
  const jobSummaries = useJobSummaries();
  const titleForJob = useCallback(
    (jobId: number) =>
      jobSummaries.get(jobId)?.title ??
      interpolate(fallbackTemplate, { id: String(jobId) }),
    [jobSummaries, fallbackTemplate],
  );
  const companyForJob = useCallback(
    (jobId: number) => jobSummaries.get(jobId)?.company ?? null,
    [jobSummaries],
  );
  const summaryForJob = useCallback(
    (jobId: number): JobSummary | null => jobSummaries.get(jobId) ?? null,
    [jobSummaries],
  );
  return {
    applicationsQuery,
    updateApplication,
    jobSummaries,
    titleForJob,
    companyForJob,
    summaryForJob,
  };
}
