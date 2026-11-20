import { renderHook, waitFor } from '@testing-library/react';
import { seedSkills } from '../../mocks/data';
import {
  ApiTestWrapper,
  mockApiJson,
  waitForQuerySuccess,
} from '../../test/TestUtils';
import {
  useCreateSkill,
  useDeleteSkill,
  useSkills,
  useUpdateSkill,
} from './skills';

describe('skills api', () => {
  it('fetches the seeded skill catalog', async () => {
    const { result } = renderHook(() => useSkills(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.skills).toHaveLength(seedSkills.length);
    expect(result.current.data?.skills[0]?.name).toBeDefined();
  });

  it('creates a skill and refreshes the list', async () => {
    const { result } = renderHook(
      () => ({ skills: useSkills(), create: useCreateSkill() }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.skills.isSuccess);
    const before = result.current.skills.data?.skills.length ?? 0;

    result.current.create.mutate({ name: 'Rust', group: 'backend' });
    await waitForQuerySuccess(() => result.current.create.isSuccess);

    await waitForQuerySuccess(
      () => (result.current.skills.data?.skills.length ?? 0) > before,
    );
    expect(
      result.current.skills.data?.skills.some((s) => s.name === 'Rust'),
    ).toBe(true);
  });

  it('updates a skill group via PATCH', async () => {
    const { result } = renderHook(
      () => ({ skills: useSkills(), update: useUpdateSkill() }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.skills.isSuccess);
    const react = result.current.skills.data?.skills.find(
      (s) => s.name === 'React',
    );
    if (!react) throw new Error('expected seeded React skill');

    result.current.update.mutate({
      id: react.id,
      patch: { group: 'backend' },
    });
    await waitForQuerySuccess(() => result.current.update.isSuccess);

    await waitFor(() => {
      const updated = result.current.skills.data?.skills.find(
        (s) => s.id === react.id,
      );
      expect(updated?.group).toBe('backend');
    });
  });

  it('deletes a skill', async () => {
    const { result } = renderHook(
      () => ({ skills: useSkills(), remove: useDeleteSkill() }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.skills.isSuccess);
    const svelte = result.current.skills.data?.skills.find(
      (s) => s.name === 'Svelte',
    );
    if (!svelte) throw new Error('expected seeded Svelte skill');
    const before = result.current.skills.data?.skills.length ?? 0;

    result.current.remove.mutate(svelte.id);
    await waitForQuerySuccess(() => result.current.remove.isSuccess);

    await waitFor(() => {
      expect(result.current.skills.data?.skills).toHaveLength(before - 1);
      expect(
        result.current.skills.data?.skills.some((s) => s.id === svelte.id),
      ).toBe(false);
    });
  });

  it('surfaces a conflict when creating a duplicate name', async () => {
    const { result } = renderHook(() => useCreateSkill(), {
      wrapper: ApiTestWrapper,
    });
    result.current.mutate({ name: 'react', group: 'backend' });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('surfaces list errors', async () => {
    mockApiJson(
      'get',
      '/api/skills',
      { error: { code: 'UPSTREAM', message: 'Skills unavailable' } },
      500,
    );
    const { result } = renderHook(() => useSkills(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isError);
  });
});
