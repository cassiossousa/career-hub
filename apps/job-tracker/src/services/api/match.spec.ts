import { renderHook } from '@testing-library/react';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import {
  MATCH_ALGORITHMS,
  useApplicationMatch,
  useJobMatch,
  useJobMatchAllAlgorithms,
} from './match';

describe('match api', () => {
  it('scores a job against the portfolio baseline', async () => {
    const { result } = renderHook(() => useJobMatch(1), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const data = result.current.data;
    expect(data?.baseline.kind).toBe('portfolio');
    expect(data?.algorithm).toBe('hybrid');
    expect(data?.score).toBeGreaterThanOrEqual(0);
    expect(data?.score).toBeLessThanOrEqual(100);
  });

  it('uses the application resume as baseline when applicationId is set', async () => {
    const { result } = renderHook(
      () => useJobMatch(1, { applicationId: 1, algorithm: 'keyword' }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.baseline.kind).toBe('resume');
    expect(result.current.data?.baseline.applicationId).toBe(1);
    expect(result.current.data?.algorithm).toBe('keyword');
  });

  it('scores an application match', async () => {
    const { result } = renderHook(() => useApplicationMatch(1), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.baseline.kind).toBe('resume');
    expect(result.current.data?.baseline.applicationId).toBe(1);
  });

  it('scores a job under every algorithm', async () => {
    const { result } = renderHook(() => useJobMatchAllAlgorithms(1), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() =>
      result.current.every((entry) => entry.result !== undefined),
    );
    expect(result.current.map((entry) => entry.algorithm)).toEqual([
      ...MATCH_ALGORITHMS,
    ]);
    for (const entry of result.current) {
      expect(entry.result?.score).toBeGreaterThanOrEqual(0);
      expect(entry.isError).toBe(false);
    }
  });

  it('surfaces an error for an unknown job', async () => {
    const { result } = renderHook(() => useJobMatch(99999), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isError);
    expect(result.current.isSuccess).toBe(false);
  });
});
