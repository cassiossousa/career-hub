import { renderHook, waitFor } from '@testing-library/react';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import type { Job, JobStats } from '../types/job';
import { useCreateJob, useJob, useJobStats, useJobs } from './jobs';

function currentJobs(result: { data: Job[] | undefined }) {
  const data = result.data;
  if (!data) throw new Error('expected jobs data to be defined');
  return data;
}

describe('useJobs', () => {
  it('returns all seeded jobs unfiltered', async () => {
    const { result } = renderHook(() => useJobs(), { wrapper: ApiTestWrapper });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(currentJobs(result.current).length).toBeGreaterThanOrEqual(8);
  });

  it('applies level filter from query params', async () => {
    const { result } = renderHook(() => useJobs({ level: 'junior' }), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const jobs = currentJobs(result.current);
    expect(jobs.every((j) => j.level === 'junior')).toBe(true);
    expect(jobs.length).toBe(2);
  });

  it('passes remoteOnly=false and maxAgeDays params', async () => {
    const { result } = renderHook(
      () => useJobs({ remoteOnly: false, maxAgeDays: 365 }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(currentJobs(result.current).length).toBeGreaterThanOrEqual(8);
  });

  it('sorts by match score ascending', async () => {
    const { result } = renderHook(() => useJobs({ sort: 'match_score_asc' }), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const scores = currentJobs(result.current).map((j) => j.matchScore ?? 999);
    expect(scores).toEqual(scores.toSorted((a, b) => a - b));
  });

  it('sorts by match score descending', async () => {
    const { result } = renderHook(() => useJobs({ sort: 'match_score_desc' }), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const scores = currentJobs(result.current).map((j) => j.matchScore ?? -1);
    expect(scores).toEqual(scores.toSorted((a, b) => b - a));
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
    expect(stats?.total).toBeGreaterThanOrEqual(8);
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
