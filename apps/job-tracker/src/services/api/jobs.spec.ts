import { renderHook, waitFor } from '@testing-library/react';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import type { Job, JobListPage, JobStats } from '../types/job';
import { useCreateJob, useJob, useJobStats, useJobs } from './jobs';

function currentJobs(result: { data: JobListPage | undefined }): Job[] {
  const data = result.data;
  if (!data) throw new Error('expected jobs data to be defined');
  return data.jobs;
}

describe('useJobs', () => {
  it('returns all seeded jobs unfiltered', async () => {
    const { result } = renderHook(() => useJobs(), { wrapper: ApiTestWrapper });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(currentJobs(result.current).length).toBeGreaterThanOrEqual(4);
  });

  it('applies level filter from query params', async () => {
    const { result } = renderHook(() => useJobs({ level: 'junior' }), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const jobs = currentJobs(result.current);
    expect(jobs.every((j) => j.level === 'junior')).toBe(true);
    expect(jobs.length).toBe(1);
  });

  it('passes remoteOnly=false and maxAgeDays params', async () => {
    const { result } = renderHook(
      () => useJobs({ remoteOnly: false, maxAgeDays: 365 }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(currentJobs(result.current).length).toBeGreaterThanOrEqual(4);
  });

  it('returns jobs sorted by most recent posting first', async () => {
    const { result } = renderHook(() => useJobs(), { wrapper: ApiTestWrapper });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const dates = currentJobs(result.current).map((j) =>
      j.postedAt ? new Date(j.postedAt).getTime() : 0,
    );
    expect(dates).toEqual(dates.toSorted((a, b) => b - a));
  });
});

describe('useJob', () => {
  it('fetches a single job', async () => {
    const { result } = renderHook(() => useJob(1), { wrapper: ApiTestWrapper });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.title).toBe('Frontend Developer');
  });

  it('surfaces an error for a missing job', async () => {
    const { result } = renderHook(() => useJob(99999), {
      wrapper: ApiTestWrapper,
    });
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 8000 },
    );
  });
});

describe('useJobStats', () => {
  it('fetches job statistics', async () => {
    const { result } = renderHook(() => useJobStats(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const stats: JobStats | undefined = result.current.data;
    expect(stats?.total).toBeGreaterThanOrEqual(4);
  });
});

describe('useCreateJob', () => {
  it('creates a job and invalidates the list', async () => {
    const { result } = renderHook(
      () => ({
        list: useJobs(),
        create: useCreateJob(),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.list.isSuccess);
    const before = currentJobs(result.current.list).length;

    result.current.create.mutate({
      source: 'manual',
      url: 'https://jobs.example.com/new',
      title: 'Created Job',
      company: 'Acme',
      location: 'Remote',
      area: 'frontend',
      level: 'mid',
      description: 'desc',
      remote: true,
    });
    await waitForQuerySuccess(() => result.current.create.isSuccess);
    expect(result.current.create.data?.title).toBe('Created Job');

    await waitFor(
      () => {
        expect(currentJobs(result.current.list).length).toBe(before + 1);
      },
      { timeout: 8000 },
    );
  }, 20000);
});
