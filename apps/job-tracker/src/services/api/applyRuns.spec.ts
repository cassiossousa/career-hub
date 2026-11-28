import { renderHook } from '@testing-library/react';
import { seedApplyRuns } from '../../mocks/data';
import { expectApiErrorCode } from '../../test/apiError';
import {
  ApiTestWrapper,
  mockApiJson,
  waitForQuerySuccess,
} from '../../test/TestUtils';
import {
  useApplyArtifact,
  useApplyRun,
  useApplyRuns,
  useEnqueueApplyRun,
  useReviewApplyRun,
} from './applyRuns';
import { apiClient } from './client';

describe('apply runs api', () => {
  it('lists the seeded runs', async () => {
    const { result } = renderHook(() => useApplyRuns(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.total).toBe(seedApplyRuns.length);
    expect(result.current.data?.runs[0]?.status).toBeDefined();
  });

  it('filters runs by status', async () => {
    const { result } = renderHook(
      () => useApplyRuns({ status: 'ready_for_review' }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(
      result.current.data?.runs.every((r) => r.status === 'ready_for_review'),
    ).toBe(true);
    expect(result.current.data?.total).toBe(1);
  });

  it('fetches a single run with form fields', async () => {
    const { result } = renderHook(() => useApplyRun(1), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.formFields.length).toBeGreaterThan(0);
    expect(result.current.data?.proposedAnswers.email?.value).toBe(
      'cassio@example.com',
    );
  });

  it('enqueues a run for a saved application', async () => {
    const { result } = renderHook(
      () => ({
        enqueue: useEnqueueApplyRun(),
        runs: useApplyRuns(),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.runs.isSuccess);
    const before = result.current.runs.data?.total ?? 0;

    result.current.enqueue.mutate(10);
    await waitForQuerySuccess(() => result.current.enqueue.isSuccess);

    expect(result.current.enqueue.data?.status).toBe('queued');
    await waitForQuerySuccess(() => {
      const page = result.current.runs.data;
      return page !== undefined && page.total === before + 1;
    });
  });

  it('rejects enqueue for a non-saved application', async () => {
    const { result } = renderHook(() => useEnqueueApplyRun(), {
      wrapper: ApiTestWrapper,
    });
    result.current.mutate(1); // application 1 is 'applied'
    await waitForQuerySuccess(() => result.current.isError);
    await expectApiErrorCode(
      apiClient.post('/api/applications/1/apply'),
      'apply_conflict',
    );
  });

  it('reviews a run: edit then approve', async () => {
    const { result } = renderHook(
      () => ({
        run: useApplyRun(1),
        review: useReviewApplyRun(),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.run.isSuccess);

    result.current.review.mutate({
      id: 1,
      review: { action: 'edit', answers: { phone: '+55 11 98888-7777' } },
    });
    await waitForQuerySuccess(() => result.current.review.isSuccess);
    expect(result.current.review.data?.proposedAnswers.phone?.value).toBe(
      '+55 11 98888-7777',
    );
    expect(result.current.review.data?.proposedAnswers.phone?.source).toBe(
      'manual',
    );

    result.current.review.mutate({ id: 1, review: { action: 'approve' } });
    await waitForQuerySuccess(() => result.current.review.isSuccess);
    expect(result.current.review.data?.status).toBe('approved');

    result.current.review.mutate({
      id: 1,
      review: { action: 'mark_submitted' },
    });
    await waitForQuerySuccess(() => result.current.review.isSuccess);
    expect(result.current.review.data?.status).toBe('submitted');
    expect(result.current.review.data?.submittedAt).not.toBeNull();
  });

  it('fetches an artifact preview', async () => {
    const { result } = renderHook(() => useApplyArtifact(1, 'resume.txt'), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.contentType).toBe('text/plain');
    expect(result.current.data?.text).toContain('Cassio');
  });

  it('surfaces a 404 for a missing run', async () => {
    await expectApiErrorCode(
      apiClient.get('/api/apply-runs/9999'),
      'not_found',
    );
  });

  it('surfaces list errors', async () => {
    mockApiJson(
      'get',
      '/api/apply-runs',
      { error: { code: 'UPSTREAM', message: 'Runs unavailable' } },
      500,
    );
    const { result } = renderHook(() => useApplyRuns(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isError);
  });
});
