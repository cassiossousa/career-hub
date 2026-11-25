import {
  type UseMutationOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import type {
  Offer,
  OfferCreate,
  OfferListPage,
  OfferUpdate,
} from '../types/offer';
import { apiClient } from './client';
import {
  useInvalidatingDelete,
  useInvalidatingMutation,
} from './mutationUtils';
import { offerResponseSchema, offersResponseSchema } from './schemas';

const OFFERS_QUERY_KEY = ['offers'];

function applicationOffersKey(applicationId: number) {
  return [...OFFERS_QUERY_KEY, 'application', applicationId] as const;
}

export function useApplicationOffers(
  applicationId: number,
  options?: Omit<UseQueryOptions<OfferListPage>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: applicationOffersKey(applicationId),
    queryFn: async () => {
      const response = await apiClient.get<unknown>(
        `/api/applications/${applicationId}/offers`,
      );
      return offersResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useCreateOffer(
  applicationId: number,
  options?: Omit<UseMutationOptions<Offer, Error, OfferCreate>, 'mutationFn'>,
) {
  return useInvalidatingMutation(
    async (data: OfferCreate) => {
      const response = await apiClient.post<unknown>(
        `/api/applications/${applicationId}/offers`,
        data,
      );
      return offerResponseSchema.parse(response.data);
    },
    () => [applicationOffersKey(applicationId)],
    options,
  );
}

export function useUpdateOffer(
  applicationId: number,
  options?: Omit<
    UseMutationOptions<Offer, Error, { id: number; data: OfferUpdate }>,
    'mutationFn'
  >,
) {
  return useInvalidatingMutation(
    async ({ id, data }: { id: number; data: OfferUpdate }) => {
      const response = await apiClient.patch<unknown>(
        `/api/offers/${id}`,
        data,
      );
      return offerResponseSchema.parse(response.data);
    },
    () => [applicationOffersKey(applicationId)],
    options,
  );
}

export function useDeleteOffer(
  applicationId: number,
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) {
  return useInvalidatingDelete(
    (id) => apiClient.delete(`/api/offers/${id}`),
    () => [applicationOffersKey(applicationId)],
    options,
  );
}
