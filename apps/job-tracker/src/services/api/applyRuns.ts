import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  ApplyArtifact,
  ApplyRun,
  ApplyRunListPage,
  ApplyRunReview,
  ApplyRunStatus,
} from '../types/applyRun';
import { apiClient } from './client';
import { paginationParams } from './pagination';
import {
  applyArtifactResponseSchema,
  applyRunResponseSchema,
  applyRunsResponseSchema,
} from './schemas';

const APPLY_RUNS_QUERY_KEY = ['apply-runs'];

const APPLY_RUNS_PAGE_SIZE = 50;

export interface ApplyRunsQueryFilter {
  status?: ApplyRunStatus | undefined;
  applicationId?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export function useApplyRuns(
  filter: ApplyRunsQueryFilter = {},
  options?: Omit<UseQueryOptions<ApplyRunListPage>, 'queryKey' | 'queryFn'>,
) {
  const {
    limit = APPLY_RUNS_PAGE_SIZE,
    offset = 0,
    status,
    applicationId,
  } = filter;
  const params = paginationParams(limit, offset);
  if (status) params.set('status', status);
  if (applicationId) params.set('application_id', String(applicationId));

  return useQuery({
    queryKey: [...APPLY_RUNS_QUERY_KEY, filter],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/apply-runs?${params.toString()}`,
      );
      return applyRunsResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useApplyRun(
  id: number,
  options?: Omit<UseQueryOptions<ApplyRun>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...APPLY_RUNS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/apply-runs/${id}`);
      return applyRunResponseSchema.parse(response.data);
    },
    ...options,
  });
}

/** Latest run for an application (queue UI orders by recency). */
export function useLatestApplyRun(
  applicationId: number,
  options?: Omit<UseQueryOptions<ApplyRunListPage>, 'queryKey' | 'queryFn'>,
) {
  return useApplyRuns({ applicationId, limit: 1 }, options);
}

function useInvalidateApplyRuns() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: APPLY_RUNS_QUERY_KEY });
  };
}

export function useEnqueueApplyRun(
  options?: Omit<UseMutationOptions<ApplyRun, Error, number>, 'mutationFn'>,
) {
  const invalidate = useInvalidateApplyRuns();
  return useMutation({
    mutationFn: async (applicationId: number) => {
      const response = await apiClient.post(
        `/api/applications/${applicationId}/apply`,
      );
      return applyRunResponseSchema.parse(response.data);
    },
    onSuccess: invalidate,
    ...options,
  });
}

export function useReviewApplyRun(
  options?: Omit<
    UseMutationOptions<ApplyRun, Error, { id: number; review: ApplyRunReview }>,
    'mutationFn'
  >,
) {
  const invalidate = useInvalidateApplyRuns();
  return useMutation({
    mutationFn: async ({
      id,
      review,
    }: {
      id: number;
      review: ApplyRunReview;
    }) => {
      const response = await apiClient.patch(`/api/apply-runs/${id}`, review);
      return applyRunResponseSchema.parse(response.data);
    },
    onSuccess: invalidate,
    ...options,
  });
}

/** Re-drafts the run's AI-eligible answers; returns the updated run. */
export function useRedraftApplyRun(
  options?: Omit<UseMutationOptions<ApplyRun, Error, number>, 'mutationFn'>,
) {
  const invalidate = useInvalidateApplyRuns();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/api/apply-runs/${id}/redraft`);
      return applyRunResponseSchema.parse(response.data);
    },
    onSuccess: invalidate,
    ...options,
  });
}

/** Fetches one stored artifact (resume/cover-letter text) for preview. */
export function useApplyArtifact(
  runId: number,
  name: string,
  options?: Omit<UseQueryOptions<ApplyArtifact>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...APPLY_RUNS_QUERY_KEY, runId, 'artifacts', name],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/apply-runs/${runId}/artifacts/${encodeURIComponent(name)}`,
      );
      return applyArtifactResponseSchema.parse(response.data);
    },
    ...options,
  });
}
