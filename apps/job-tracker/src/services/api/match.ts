import {
  type UseQueryOptions,
  useQueries,
  useQuery,
} from '@tanstack/react-query';
import {
  MATCH_ALGORITHMS,
  type MatchAlgorithm,
  type MatchResult,
} from '../types/match';
import { apiClient } from './client';
import { matchResponseSchema } from './schemas';

const MATCH_QUERY_KEY = 'match';

export interface JobMatchParams {
  algorithm?: MatchAlgorithm | undefined;
  applicationId?: number | undefined;
}

export function useJobMatch(
  jobId: number,
  params: JobMatchParams = {},
  options?: Omit<UseQueryOptions<MatchResult>, 'queryKey' | 'queryFn'>,
) {
  const algorithm = params.algorithm ?? 'hybrid';
  const queryParams = new URLSearchParams({ algorithm });
  if (params.applicationId !== undefined) {
    queryParams.set('applicationId', String(params.applicationId));
  }

  return useQuery({
    queryKey: [MATCH_QUERY_KEY, 'job', jobId, algorithm, params.applicationId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/jobs/${jobId}/match?${queryParams.toString()}`,
      );
      return matchResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useApplicationMatch(
  applicationId: number,
  params: { algorithm?: MatchAlgorithm | undefined } = {},
  options?: Omit<UseQueryOptions<MatchResult>, 'queryKey' | 'queryFn'>,
) {
  const algorithm = params.algorithm ?? 'hybrid';

  return useQuery({
    queryKey: [MATCH_QUERY_KEY, 'application', applicationId, algorithm],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/applications/${applicationId}/match?algorithm=${algorithm}`,
      );
      return matchResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export interface AlgorithmMatch {
  algorithm: MatchAlgorithm;
  result: MatchResult | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

/** Scores one job under every algorithm; per-algorithm failures stay isolated. */
export function useJobMatchAllAlgorithms(
  jobId: number,
  params: Omit<JobMatchParams, 'algorithm'> = {},
) {
  const queries = useQueries({
    queries: MATCH_ALGORITHMS.map((algorithm) => ({
      queryKey: [
        MATCH_QUERY_KEY,
        'job',
        jobId,
        algorithm,
        params.applicationId,
      ],
      queryFn: async () => {
        const queryParams = new URLSearchParams({ algorithm });
        if (params.applicationId !== undefined) {
          queryParams.set('applicationId', String(params.applicationId));
        }
        const response = await apiClient.get(
          `/api/jobs/${jobId}/match?${queryParams.toString()}`,
        );
        return matchResponseSchema.parse(response.data);
      },
    })),
  });

  return MATCH_ALGORITHMS.map((algorithm, index): AlgorithmMatch => {
    const query = queries[index];
    return {
      algorithm,
      result: query?.data,
      isLoading: query?.isLoading ?? false,
      isError: query?.isError ?? false,
      error: query?.error,
    };
  });
}
