import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  Skill,
  SkillCreate,
  SkillGroupLabels,
  SkillGroupLabelsList,
  SkillListPage,
  SkillPatch,
} from '../types/skills';
import { apiClient } from './client';
import {
  skillGroupLabelsListSchema,
  skillGroupLabelsResponseSchema,
  skillResponseSchema,
  skillsResponseSchema,
} from './schemas';

export const SKILLS_QUERY_KEY = ['skills'];
export const SKILL_GROUP_LABELS_QUERY_KEY = ['skill-group-labels'];

const SKILLS_PAGE_SIZE = 200;

/** Fetches the full catalog, paging through the bounded list endpoint. */
export function useSkills(
  options?: Omit<UseQueryOptions<SkillListPage>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: async () => {
      const skills: Skill[] = [];
      let total = Number.POSITIVE_INFINITY;
      while (skills.length < total) {
        const offset = skills.length;
        const response = await apiClient.get<unknown>(
          `/api/skills?limit=${SKILLS_PAGE_SIZE}&offset=${offset}`,
        );
        const page = skillsResponseSchema.parse(response.data);
        skills.push(...page.skills);
        total = page.total;
        if (page.skills.length === 0) break;
      }
      return { skills, total };
    },
    ...options,
  });
}

function useInvalidateSkills() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
  };
}

export function useCreateSkill(
  options?: Omit<UseMutationOptions<Skill, Error, SkillCreate>, 'mutationFn'>,
) {
  const invalidate = useInvalidateSkills();
  return useMutation({
    mutationFn: async (data: SkillCreate) => {
      const response = await apiClient.post<unknown>('/api/skills', data);
      return skillResponseSchema.parse(response.data);
    },
    onSuccess: invalidate,
    ...options,
  });
}

export interface UpdateSkillVariables {
  id: number;
  patch: SkillPatch;
}

export function useUpdateSkill(
  options?: Omit<
    UseMutationOptions<Skill, Error, UpdateSkillVariables>,
    'mutationFn'
  >,
) {
  const invalidate = useInvalidateSkills();
  return useMutation({
    mutationFn: async ({ id, patch }: UpdateSkillVariables) => {
      const response = await apiClient.patch<unknown>(
        `/api/skills/${id}`,
        patch,
      );
      return skillResponseSchema.parse(response.data);
    },
    onSuccess: invalidate,
    ...options,
  });
}

export function useDeleteSkill(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) {
  const invalidate = useInvalidateSkills();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/skills/${id}`);
    },
    onSuccess: invalidate,
    ...options,
  });
}

export function useSkillGroupLabels(
  options?: Omit<UseQueryOptions<SkillGroupLabelsList>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: SKILL_GROUP_LABELS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/api/skill-group-labels');
      return skillGroupLabelsListSchema.parse(response.data);
    },
    ...options,
  });
}

export function useReplaceSkillGroupLabels(
  options?: Omit<
    UseMutationOptions<SkillGroupLabels, Error, SkillGroupLabels>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ group, labels }: SkillGroupLabels) => {
      const response = await apiClient.put<unknown>(
        `/api/skill-group-labels/${group}`,
        { labels },
      );
      return skillGroupLabelsResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: SKILL_GROUP_LABELS_QUERY_KEY,
      });
    },
    ...options,
  });
}
