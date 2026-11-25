import { renderHook, waitFor } from '@testing-library/react';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import { isApiError } from './client';
import {
  useCoverLetter,
  useDeleteCoverLetter,
  useUpsertCoverLetter,
} from './coverLetters';

describe('coverLetters api', () => {
  it('returns the seeded cover letter for an application', async () => {
    const { result } = renderHook(() => useCoverLetter(1), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.applicationId).toBe(1);
    expect(result.current.data?.bodyText).not.toBe('');
  });

  it('resolves to null when the application has no cover letter', async () => {
    const { result } = renderHook(() => useCoverLetter(2), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it('upserts a cover letter and refetches it', async () => {
    const { result } = renderHook(
      () => ({
        letter: useCoverLetter(2),
        upsert: useUpsertCoverLetter(2),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.letter.isSuccess);
    expect(result.current.letter.data).toBeNull();

    result.current.upsert.mutate({
      locale: 'en',
      subject: 'Excited to apply',
      bodyText: 'Hello there.',
    });
    await waitForQuerySuccess(() => result.current.upsert.isSuccess);
    expect(result.current.upsert.data?.subject).toBe('Excited to apply');

    await waitFor(() => {
      expect(result.current.letter.data?.bodyText).toBe('Hello there.');
    });
  });

  it('replaces an existing cover letter on upsert', async () => {
    const { result } = renderHook(() => useUpsertCoverLetter(1), {
      wrapper: ApiTestWrapper,
    });
    result.current.mutate({ locale: 'en', bodyText: 'Rewritten letter.' });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.bodyText).toBe('Rewritten letter.');
  });

  it('deletes a cover letter and errors when none exists', async () => {
    const { result } = renderHook(
      () => ({
        letter: useCoverLetter(1),
        delete: useDeleteCoverLetter(1),
        deleteMissing: useDeleteCoverLetter(2),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.letter.isSuccess);

    result.current.delete.mutate();
    await waitFor(() => {
      expect(result.current.letter.data).toBeNull();
    });

    result.current.deleteMissing.mutate();
    await waitFor(() => {
      expect(result.current.deleteMissing.isError).toBe(true);
    });
    const error = result.current.deleteMissing.error;
    expect(isApiError(error) && error.code).toBe('not_found');
  });
});
