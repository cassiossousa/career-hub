import { renderHook } from '@testing-library/react';
import { seedIngestionRuns } from '../../mocks/data';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import type { IngestionRunListPage } from '../types/ingestion';
import { useIngestionRuns, useTriggerIngestionRuns } from './ingestion';

function currentRuns(result: {
  data: IngestionRunListPage | undefined;
}): IngestionRunListPage['runs'] {
  const data = result.data;
  if (!data) throw new Error('expected ingestion runs data to be defined');
  return data.runs;
}

describe('useIngestionRuns', () => {
  it('returns seeded runs newest first', async () => {
    const { result } = renderHook(() => useIngestionRuns(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const runs = currentRuns(result.current);
    expect(runs.length).toBe(seedIngestionRuns.length);
    const ids = runs.map((r) => r.id);
    expect(ids).toEqual(ids.toSorted((a, b) => b - a));
  });
});

describe('useTriggerIngestionRuns', () => {
  it('triggers all ingestible sources and refreshes the list', async () => {
    const { result } = renderHook(
      () => ({
        runs: useIngestionRuns(),
        trigger: useTriggerIngestionRuns(),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.runs.isSuccess);
    const before = currentRuns(result.current.runs).length;

    result.current.trigger.mutate({});
    await waitForQuerySuccess(() => result.current.trigger.isSuccess);

    const created = result.current.trigger.data;
    expect(created?.runs.length).toBeGreaterThan(0);
    expect(created?.runs.map((r) => r.source)).toContain('remote');
    expect(created?.runs.find((r) => r.source === 'gupy')?.status).toBe(
      'failed',
    );

    await waitForQuerySuccess(
      () => currentRuns(result.current.runs).length > before,
    );
  }, 20000);

  it('triggers a single source when specified', async () => {
    const { result } = renderHook(() => useTriggerIngestionRuns(), {
      wrapper: ApiTestWrapper,
    });

    result.current.mutate({ source: 'solides' });
    await waitForQuerySuccess(() => result.current.isSuccess);

    expect(result.current.data?.runs).toHaveLength(1);
    expect(result.current.data?.runs[0]?.source).toBe('solides');
    expect(result.current.data?.runs[0]?.status).toBe('succeeded');
  }, 20000);
});
