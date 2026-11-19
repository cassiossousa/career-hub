import { renderHook, waitFor } from '@testing-library/react';
import { seedPortfolio } from '../../mocks/data';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import { usePortfolio, useUpsertPortfolio } from './portfolio';

describe('portfolio api', () => {
  it('fetches the seeded portfolio', async () => {
    const { result } = renderHook(() => usePortfolio(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.basics.fullName).toBe(
      seedPortfolio.basics.fullName,
    );
  });

  it('upserts portfolio basics', async () => {
    const { result } = renderHook(
      () => ({ portfolio: usePortfolio(), upsert: useUpsertPortfolio() }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.portfolio.isSuccess);
    const current = result.current.portfolio.data;
    if (!current) throw new Error('expected portfolio');

    result.current.upsert.mutate({
      ...current,
      basics: { ...current.basics, fullName: 'New Name' },
    });
    await waitForQuerySuccess(() => result.current.upsert.isSuccess);

    await waitFor(() => {
      expect(result.current.portfolio.data?.basics.fullName).toBe('New Name');
    });
  });
});
