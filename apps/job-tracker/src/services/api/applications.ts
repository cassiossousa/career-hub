import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  Application,
  ApplicationCreate,
  ApplicationUpdate,
} from '../types/application';
import { apiClient } from './client';
import {
  applicationResponseSchema,
  applicationsResponseSchema,
} from './schemas';

const APPLICATIONS_QUERY_KEY = ['applications'];

export function useApplications(
  filter: { status?: string | undefined; jobId?: number | undefined } = {},
  options?: Omit<UseQueryOptions<Application[]>, 'queryKey' | 'queryFn'>,
) {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.jobId) params.set('jobId', String(filter.jobId));

  return useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, filter],
    queryFn: async () => {
      const response = await apiClient.get<unknown>(
        `/api/applications?${params.toString()}`,
      );
      return applicationsResponseSchema.parse(response.data).applications;
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
      const response = await apiClient.post<unknown>('/api/applications', data);
      return applicationResponseSchema.parse(response.data).application;
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
      const response = await apiClient.patch<unknown>(
        `/api/applications/${id}`,
        data,
      );
      return applicationResponseSchema.parse(response.data).application;
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
