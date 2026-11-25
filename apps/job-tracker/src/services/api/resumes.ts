import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Resume, ResumeDocument } from '../types/resume';
import { apiClient, isApiError } from './client';
import { resumeResponseSchema } from './schemas';

const RESUMES_QUERY_KEY = ['resumes'];

function isNotFound(error: unknown): boolean {
  return isApiError(error) && error.code === 'not_found';
}

/** Resume owned by an application; `null` data when none exists yet (404). */
export function useApplicationResume(
  applicationId: number,
  options?: Omit<UseQueryOptions<Resume | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...RESUMES_QUERY_KEY, 'application', applicationId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `/api/applications/${applicationId}/resume`,
        );
        return resumeResponseSchema.parse(response.data);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    ...options,
  });
}

export function useUpsertApplicationResume(
  applicationId: number,
  options?: Omit<
    UseMutationOptions<Resume, Error, ResumeDocument>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ResumeDocument) => {
      const response = await apiClient.put(
        `/api/applications/${applicationId}/resume`,
        data,
      );
      return resumeResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...RESUMES_QUERY_KEY, 'application', applicationId],
      });
    },
    ...options,
  });
}
