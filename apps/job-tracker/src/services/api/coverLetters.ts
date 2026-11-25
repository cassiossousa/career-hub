import {
  type UseMutationOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import type { CoverLetter, CoverLetterUpsert } from '../types/coverLetter';
import { apiClient, isApiError } from './client';
import { useInvalidatingMutation } from './mutationUtils';
import { coverLetterResponseSchema } from './schemas';

const COVER_LETTERS_QUERY_KEY = ['coverLetters'];

function isNotFound(error: unknown): boolean {
  return isApiError(error) && error.code === 'not_found';
}

/** Cover letter for an application; `null` data when none exists yet (404). */
export function useCoverLetter(
  applicationId: number,
  options?: Omit<UseQueryOptions<CoverLetter | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...COVER_LETTERS_QUERY_KEY, applicationId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `/api/applications/${applicationId}/cover-letter`,
        );
        return coverLetterResponseSchema.parse(response.data);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    ...options,
  });
}

export function useUpsertCoverLetter(
  applicationId: number,
  options?: Omit<
    UseMutationOptions<CoverLetter, Error, CoverLetterUpsert>,
    'mutationFn'
  >,
) {
  return useInvalidatingMutation(
    async (data: CoverLetterUpsert) => {
      const response = await apiClient.put(
        `/api/applications/${applicationId}/cover-letter`,
        data,
      );
      return coverLetterResponseSchema.parse(response.data);
    },
    () => [[...COVER_LETTERS_QUERY_KEY, applicationId]],
    options,
  );
}

export function useDeleteCoverLetter(
  applicationId: number,
  options?: Omit<UseMutationOptions<void>, 'mutationFn'>,
) {
  return useInvalidatingMutation(
    async () => {
      await apiClient.delete(`/api/applications/${applicationId}/cover-letter`);
    },
    () => [[...COVER_LETTERS_QUERY_KEY, applicationId]],
    options,
  );
}
