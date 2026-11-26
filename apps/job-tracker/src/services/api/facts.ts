import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  ProfileFact,
  ProfileFactListPage,
  ProfileFactUpsert,
} from '../types/facts';
import { apiClient } from './client';
import {
  profileFactResponseSchema,
  profileFactsResponseSchema,
} from './schemas';

export const PROFILE_FACTS_QUERY_KEY = ['profile-facts'];

const FACTS_PAGE_SIZE = 200;

/** Fetches every profile fact, paging through the bounded list endpoint. */
export function useProfileFacts(
  options?: Omit<UseQueryOptions<ProfileFactListPage>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: PROFILE_FACTS_QUERY_KEY,
    queryFn: async () => {
      const facts: ProfileFact[] = [];
      let total = Number.POSITIVE_INFINITY;
      while (facts.length < total) {
        const offset = facts.length;
        const response = await apiClient.get(
          `/api/facts?limit=${FACTS_PAGE_SIZE}&offset=${offset}`,
        );
        const page = profileFactsResponseSchema.parse(response.data);
        facts.push(...page.facts);
        total = page.total;
        if (page.facts.length === 0) break;
      }
      return { facts, total };
    },
    ...options,
  });
}

function useInvalidateProfileFacts() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: PROFILE_FACTS_QUERY_KEY });
  };
}

export interface UpsertProfileFactVariables {
  key: string;
  fact: ProfileFactUpsert;
}

export function useUpsertProfileFact(
  options?: Omit<
    UseMutationOptions<ProfileFact, Error, UpsertProfileFactVariables>,
    'mutationFn'
  >,
) {
  const invalidate = useInvalidateProfileFacts();
  return useMutation({
    mutationFn: async ({ key, fact }: UpsertProfileFactVariables) => {
      const response = await apiClient.put(
        `/api/facts/${encodeURIComponent(key)}`,
        fact,
      );
      return profileFactResponseSchema.parse(response.data);
    },
    onSuccess: invalidate,
    ...options,
  });
}

export function useDeleteProfileFact(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const invalidate = useInvalidateProfileFacts();
  return useMutation({
    mutationFn: async (key: string) => {
      await apiClient.delete(`/api/facts/${encodeURIComponent(key)}`);
    },
    onSuccess: invalidate,
    ...options,
  });
}
