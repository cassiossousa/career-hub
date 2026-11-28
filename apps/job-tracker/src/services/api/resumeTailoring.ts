import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import type { TailoredResume, TailoringSuggestions } from '../types/tailoring';
import { apiClient } from './client';
import {
  tailoredResumeResponseSchema,
  tailoringSuggestionsResponseSchema,
} from './schemas';

const RESUME_TAILORING_QUERY_KEY = ['resumeTailoring'];

/** Deterministic tailoring guidance for an application's job match — no LLM. */
export function useTailoringSuggestions(
  applicationId: number,
  options?: Omit<UseQueryOptions<TailoringSuggestions>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...RESUME_TAILORING_QUERY_KEY, 'suggestions', applicationId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/applications/${applicationId}/tailoring`,
      );
      return tailoringSuggestionsResponseSchema.parse(response.data);
    },
    ...options,
  });
}

/**
 * Opt-in LLM dry-run: returns a preview document + guard report. Nothing is
 * persisted — the human reviews and saves via the normal PUT /resume path.
 */
export function useTailorResume(
  applicationId: number,
  options?: Omit<UseMutationOptions<TailoredResume, Error, void>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        `/api/applications/${applicationId}/resume/tailor`,
        {},
      );
      return tailoredResumeResponseSchema.parse(response.data);
    },
    ...options,
  });
}
