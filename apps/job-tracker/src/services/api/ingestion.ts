import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  IngestionRunListPage,
  IngestionRunTrigger,
} from '../types/ingestion';
import { apiClient } from './client';
import { JOB_STATS_QUERY_KEY, JOBS_QUERY_KEY } from './jobs';
import { paginationParams } from './pagination';
import { ingestionRunListResponseSchema } from './schemas';

const INGESTION_RUNS_QUERY_KEY = ['ingestionRuns'];
const INGESTION_RUNS_PAGE_SIZE = 50;

export interface IngestionRunsQueryOptions {
  limit?: number | undefined;
  offset?: number | undefined;
}

export function useIngestionRuns(
  options?: Omit<
    UseQueryOptions<IngestionRunListPage>,
    'queryKey' | 'queryFn'
  > &
    IngestionRunsQueryOptions,
) {
  const {
    limit = INGESTION_RUNS_PAGE_SIZE,
    offset = 0,
    ...queryOptions
  } = options ?? {};
  const params = paginationParams(limit, offset);

  return useQuery({
    queryKey: [...INGESTION_RUNS_QUERY_KEY, limit, offset],
    queryFn: async () => {
      const response = await apiClient.get<unknown>(
        `/api/ingestion/runs?${params.toString()}`,
      );
      return ingestionRunListResponseSchema.parse(response.data);
    },
    ...queryOptions,
  });
}

export function useTriggerIngestionRuns(
  options?: Omit<
    UseMutationOptions<IngestionRunListPage, Error, IngestionRunTrigger>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trigger: IngestionRunTrigger) => {
      const body = trigger.source ? { source: trigger.source } : {};
      const response = await apiClient.post<unknown>(
        '/api/ingestion/runs',
        body,
      );
      return ingestionRunListResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: INGESTION_RUNS_QUERY_KEY,
      });
      void queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: JOB_STATS_QUERY_KEY });
    },
    ...options,
  });
}
