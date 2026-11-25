import { renderHook, waitFor } from '@testing-library/react';
import { expectApiErrorCode } from '../../test/apiError';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import { apiClient } from './client';
import {
  useCreateInterview,
  useDeleteInterview,
  useInterviews,
  useUpdateInterview,
} from './interviews';

describe('interviews api', () => {
  it('lists interviews for an application ordered by schedule', async () => {
    const { result } = renderHook(() => useInterviews(5), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const interviews = result.current.data?.interviews ?? [];
    expect(interviews).toHaveLength(2);
    expect(
      (interviews[0]?.scheduledAt ?? '') <= (interviews[1]?.scheduledAt ?? ''),
    ).toBe(true);
  });

  it('creates an interview and refetches the list', async () => {
    const { result } = renderHook(
      () => ({
        list: useInterviews(2),
        create: useCreateInterview(2),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.list.isSuccess);

    result.current.create.mutate({
      scheduledAt: '2030-01-01T10:00:00Z',
      mode: 'video',
    });
    await waitForQuerySuccess(() => result.current.create.isSuccess);
    expect(result.current.create.data?.roundLabel).toBeNull();

    await waitFor(() => {
      expect(result.current.list.data?.interviews).toHaveLength(1);
    });
  });

  it('updates and deletes an interview', async () => {
    const { result } = renderHook(
      () => ({
        list: useInterviews(5),
        update: useUpdateInterview(5),
        delete: useDeleteInterview(5),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.list.isSuccess);
    const interviewId = result.current.list.data?.interviews[0]?.id ?? 0;

    result.current.update.mutate({
      id: interviewId,
      data: { notes: 'Updated notes', outcome: 'completed' },
    });
    await waitForQuerySuccess(() => result.current.update.isSuccess);
    expect(result.current.update.data?.notes).toBe('Updated notes');

    result.current.delete.mutate(interviewId);
    await waitFor(() => {
      expect(
        result.current.list.data?.interviews.some((i) => i.id === interviewId),
      ).toBe(false);
    });
  });

  it('surfaces not_found when patching or deleting a missing interview', async () => {
    await expectApiErrorCode(
      apiClient.patch('/api/interviews/99999', { notes: 'gone' }),
      'not_found',
    );
    await expectApiErrorCode(
      apiClient.delete('/api/interviews/99999'),
      'not_found',
    );
  });
});
