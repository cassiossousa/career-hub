import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Portfolio, PortfolioDocumentWrite } from '../types/portfolio';
import { apiClient } from './client';
import { portfolioResponseSchema } from './schemas';

const PORTFOLIO_QUERY_KEY = ['portfolio'];

export function usePortfolio(
  options?: Omit<UseQueryOptions<Portfolio>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get('/api/portfolio');
      return portfolioResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useUpsertPortfolio(
  options?: Omit<
    UseMutationOptions<Portfolio, Error, PortfolioDocumentWrite>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PortfolioDocumentWrite) => {
      const response = await apiClient.put('/api/portfolio', data);
      return portfolioResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
    },
    ...options,
  });
}
