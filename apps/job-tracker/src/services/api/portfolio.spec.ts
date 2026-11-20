import { renderHook, waitFor } from '@testing-library/react';
import { seedPortfolio } from '../../mocks/data';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import type { PortfolioDocumentWrite } from '../types/portfolio';
import { usePortfolio, useUpsertPortfolio } from './portfolio';

describe('portfolio api', () => {
  it('fetches the seeded portfolio', async () => {
    const { result } = renderHook(() => usePortfolio(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const enDoc = result.current.data?.documents.en;
    expect(enDoc?.basics.fullName).toBe(
      seedPortfolio.documents.en?.basics.fullName,
    );
  });

  it('upserts a locale document', async () => {
    const { result } = renderHook(
      () => ({ portfolio: usePortfolio(), upsert: useUpsertPortfolio() }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.portfolio.isSuccess);
    const current = result.current.portfolio.data;
    if (!current) throw new Error('expected portfolio');
    const enDoc = current.documents.en;
    if (!enDoc) throw new Error('expected en document');

    const write: PortfolioDocumentWrite = {
      locale: 'en',
      basics: { ...enDoc.basics, fullName: 'New Name' },
      experience: enDoc.experience,
      skillGroups: enDoc.skillGroups,
      projects: enDoc.projects,
      filters: current.filters,
    };
    result.current.upsert.mutate(write);
    await waitForQuerySuccess(() => result.current.upsert.isSuccess);

    await waitFor(() => {
      expect(result.current.portfolio.data?.documents.en?.basics.fullName).toBe(
        'New Name',
      );
    });
  });
});
