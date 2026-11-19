import { renderHook, waitFor } from '@testing-library/react';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import type { Application } from '../types/application';
import {
  useApplications,
  useCreateApplication,
  useUpdateApplication,
} from './applications';

function currentApps(result: { data: Application[] | undefined }) {
  const data = result.data;
  if (!data) throw new Error('expected applications data');
  return data;
}

describe('applications api', () => {
  it('lists seeded applications', async () => {
    const { result } = renderHook(() => useApplications(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(currentApps(result.current).length).toBeGreaterThanOrEqual(3);
  });

  it('filters applications by status', async () => {
    const { result } = renderHook(() => useApplications({ status: 'saved' }), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const apps = currentApps(result.current);
    expect(apps.every((a) => a.status === 'saved')).toBe(true);
  });

  it('creates an application and refetches the list', async () => {
    const { result } = renderHook(
      () => ({
        list: useApplications(),
        create: useCreateApplication(),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.list.isSuccess);
    const before = currentApps(result.current.list).length;

    result.current.create.mutate({ jobId: 2, status: 'saved' });
    await waitForQuerySuccess(() => result.current.create.isSuccess);

    await waitFor(() => {
      const apps = result.current.list.data;
      expect(apps?.length).toBe(before + 1);
    });
  });

  it('updates an application status', async () => {
    const { result } = renderHook(
      () => ({
        list: useApplications(),
        update: useUpdateApplication(),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.list.isSuccess);
    const target = currentApps(result.current.list).find(
      (a) => a.status === 'saved',
    );
    if (!target) throw new Error('expected a saved application in seed');

    result.current.update.mutate({
      id: target.id,
      data: { status: 'applied', appliedAt: new Date().toISOString() },
    });
    await waitForQuerySuccess(() => result.current.update.isSuccess);

    await waitFor(() => {
      const updated = result.current.list.data?.find((a) => a.id === target.id);
      expect(updated?.status).toBe('applied');
    });
  });
});
