import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Portfolio, PortfolioCreate } from '../types/portfolio';
import { apiClient } from './client';
import { portfolioResponseSchema } from './schemas';

const PORTFOLIO_QUERY_KEY = ['portfolio'];

export function usePortfolio(
  options?: Omit<UseQueryOptions<Portfolio>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/api/portfolio');
      return portfolioResponseSchema.parse(response.data).portfolio;
    },
    ...options,
  });
}

export function useUpsertPortfolio(
  options?: Omit<
    UseMutationOptions<Portfolio, Error, PortfolioCreate>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PortfolioCreate) => {
      const response = await apiClient.put<unknown>('/api/portfolio', data);
      return portfolioResponseSchema.parse(response.data).portfolio;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
    },
    ...options,
  });
}
