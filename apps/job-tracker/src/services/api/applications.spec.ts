import { renderHook, waitFor } from '@testing-library/react';
import { seedApplications } from '../../mocks/data';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import type { Application, ApplicationListPage } from '../types/application';
import {
  useApplications,
  useCreateApplication,
  useUpdateApplication,
} from './applications';

function currentApps(result: {
  data: ApplicationListPage | undefined;
}): Application[] {
  const data = result.data;
  if (!data) throw new Error('expected applications data');
  return data.applications;
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
    expect(apps.length).toBe(
      seedApplications.filter((a) => a.status === 'saved').length,
    );
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

    result.current.create.mutate({ jobId: 4, status: 'saved' });
    await waitForQuerySuccess(() => result.current.create.isSuccess);

    await waitFor(() => {
      const apps = result.current.list.data;
      expect(apps?.applications.length).toBe(before + 1);
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
      data: {
        status: 'applied',
        appliedAt: new Date().toISOString().slice(0, 10),
      },
    });
    await waitForQuerySuccess(() => result.current.update.isSuccess);

    await waitFor(() => {
      const updated = result.current.list.data?.applications.find(
        (a) => a.id === target.id,
      );
      expect(updated?.status).toBe('applied');
    });
  });
});
