import {
  type UseMutationOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import type {
  Interview,
  InterviewCreate,
  InterviewListPage,
  InterviewUpdate,
} from '../types/interview';
import { apiClient } from './client';
import {
  useInvalidatingDelete,
  useInvalidatingMutation,
} from './mutationUtils';
import { interviewResponseSchema, interviewsResponseSchema } from './schemas';

const INTERVIEWS_QUERY_KEY = ['interviews'];

export function useInterviews(
  applicationId: number,
  options?: Omit<UseQueryOptions<InterviewListPage>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...INTERVIEWS_QUERY_KEY, applicationId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/applications/${applicationId}/interviews`,
      );
      return interviewsResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useCreateInterview(
  applicationId: number,
  options?: Omit<
    UseMutationOptions<Interview, Error, InterviewCreate>,
    'mutationFn'
  >,
) {
  return useInvalidatingMutation(
    async (data: InterviewCreate) => {
      const response = await apiClient.post(
        `/api/applications/${applicationId}/interviews`,
        data,
      );
      return interviewResponseSchema.parse(response.data);
    },
    () => [[...INTERVIEWS_QUERY_KEY, applicationId]],
    options,
  );
}

export function useUpdateInterview(
  applicationId: number,
  options?: Omit<
    UseMutationOptions<Interview, Error, { id: number; data: InterviewUpdate }>,
    'mutationFn'
  >,
) {
  return useInvalidatingMutation(
    async ({ id, data }: { id: number; data: InterviewUpdate }) => {
      const response = await apiClient.patch(`/api/interviews/${id}`, data);
      return interviewResponseSchema.parse(response.data);
    },
    () => [[...INTERVIEWS_QUERY_KEY, applicationId]],
    options,
  );
}

export function useDeleteInterview(
  applicationId: number,
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) {
  return useInvalidatingDelete(
    (id) => apiClient.delete(`/api/interviews/${id}`),
    () => [[...INTERVIEWS_QUERY_KEY, applicationId]],
    options,
  );
}
