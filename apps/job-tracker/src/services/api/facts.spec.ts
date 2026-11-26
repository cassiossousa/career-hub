import { renderHook, waitFor } from '@testing-library/react';
import { seedProfileFacts } from '../../mocks/data';
import { expectApiErrorCode } from '../../test/apiError';
import {
  ApiTestWrapper,
  mockApiJson,
  waitForQuerySuccess,
} from '../../test/TestUtils';
import { apiClient } from './client';
import {
  useDeleteProfileFact,
  useProfileFacts,
  useUpsertProfileFact,
} from './facts';

const renderFactsWithUpsert = () =>
  renderHook(
    () => ({ facts: useProfileFacts(), upsert: useUpsertProfileFact() }),
    { wrapper: ApiTestWrapper },
  );

const renderFactsWithDelete = () =>
  renderHook(
    () => ({ facts: useProfileFacts(), remove: useDeleteProfileFact() }),
    { wrapper: ApiTestWrapper },
  );

describe('profile facts api', () => {
  it('fetches the seeded facts', async () => {
    const { result } = renderHook(() => useProfileFacts(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.facts).toHaveLength(seedProfileFacts.length);
    expect(
      result.current.data?.facts.some((f) => f.key === 'work_authorization'),
    ).toBe(true);
  });

  it('upserts a fact by key and refreshes the list', async () => {
    const { result } = renderFactsWithUpsert();
    await waitForQuerySuccess(() => result.current.facts.isSuccess);
    const before = result.current.facts.data?.facts.length ?? 0;

    result.current.upsert.mutate({
      key: 'notice_period',
      fact: {
        category: 'logistics',
        value: '30 days',
        sensitivity: 'normal',
      },
    });
    await waitForQuerySuccess(() => result.current.upsert.isSuccess);

    await waitFor(() => {
      expect(result.current.facts.data?.facts.length).toBe(before + 1);
      expect(
        result.current.facts.data?.facts.some(
          (f) => f.key === 'notice_period' && f.value === '30 days',
        ),
      ).toBe(true);
    });
  });

  it('updates an existing fact in place', async () => {
    const { result } = renderFactsWithUpsert();
    await waitForQuerySuccess(() => result.current.facts.isSuccess);

    result.current.upsert.mutate({
      key: 'work_authorization',
      fact: {
        category: 'work_authorization',
        value: 'Authorized to work in Brazil and Portugal',
        sensitivity: 'normal',
      },
    });
    await waitForQuerySuccess(() => result.current.upsert.isSuccess);

    await waitFor(() => {
      const fact = result.current.facts.data?.facts.find(
        (f) => f.key === 'work_authorization',
      );
      expect(fact?.value).toBe('Authorized to work in Brazil and Portugal');
    });
  });

  it('deletes a fact', async () => {
    const { result } = renderFactsWithDelete();
    await waitForQuerySuccess(() => result.current.facts.isSuccess);
    const before = result.current.facts.data?.facts.length ?? 0;

    result.current.remove.mutate('linkedin_url');
    await waitForQuerySuccess(() => result.current.remove.isSuccess);

    await waitFor(() => {
      expect(result.current.facts.data?.facts).toHaveLength(before - 1);
      expect(
        result.current.facts.data?.facts.some((f) => f.key === 'linkedin_url'),
      ).toBe(false);
    });
  });

  it('surfaces list errors', async () => {
    mockApiJson(
      'get',
      '/api/facts',
      { error: { code: 'UPSTREAM', message: 'Facts unavailable' } },
      500,
    );
    const { result } = renderHook(() => useProfileFacts(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isError);
  });

  it('surfaces not_found on missing facts', async () => {
    await expectApiErrorCode(
      apiClient.get('/api/facts/bogus_key'),
      'not_found',
    );
    await expectApiErrorCode(
      apiClient.delete('/api/facts/bogus_key'),
      'not_found',
    );
  });
});
