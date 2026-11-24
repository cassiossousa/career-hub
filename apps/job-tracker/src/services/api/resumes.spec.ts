import { renderHook, waitFor } from '@testing-library/react';
import { expectApiErrorCode } from '../../test/apiError';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import type { ResumeDocument } from '../types/resume';
import { apiClient, isApiError } from './client';
import { useApplicationResume, useUpsertApplicationResume } from './resumes';
import { resumeResponseSchema, resumesResponseSchema } from './schemas';

const resumeDocument: ResumeDocument = {
  locale: 'en',
  summary: 'Tailored summary for tests',
  basics: {
    fullName: 'Test User',
    headline: 'Engineer',
    subtitle: '',
    username: 'testuser',
    location: 'Remote',
    avatarUrl: null,
    links: [],
  },
};

describe('application resume api', () => {
  it('fetches the seeded resume for an application', async () => {
    const { result } = renderHook(() => useApplicationResume(1), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.applicationId).toBe(1);
    expect(result.current.data?.summary).toContain('Frontend');
  });

  it('returns null when the application has no resume yet', async () => {
    const { result } = renderHook(() => useApplicationResume(3), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data).toBeNull();
  });

  it('creates a resume for a saved application', async () => {
    const { result } = renderHook(
      () => ({
        resume: useApplicationResume(3),
        upsert: useUpsertApplicationResume(3),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.resume.isSuccess);
    expect(result.current.resume.data).toBeNull();

    result.current.upsert.mutate(resumeDocument);
    await waitForQuerySuccess(() => result.current.upsert.isSuccess);
    expect(result.current.upsert.data?.applicationId).toBe(3);
    expect(result.current.upsert.data?.summary).toBe(
      'Tailored summary for tests',
    );

    await waitFor(() => {
      expect(result.current.resume.data?.summary).toBe(
        'Tailored summary for tests',
      );
    });
  });

  it('rejects updates when the resume is locked', async () => {
    const { result } = renderHook(() => useUpsertApplicationResume(1), {
      wrapper: ApiTestWrapper,
    });
    result.current.mutate(resumeDocument);
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    const error: unknown = result.current.error;
    if (!isApiError(error)) {
      throw new Error('expected ApiError');
    }
    expect(error.code).toBe('resume_locked');
  });
});

describe('standalone resumes api', () => {
  it('lists, reads, creates, and updates resumes', async () => {
    const list = await apiClient.get('/api/resumes?limit=10');
    const parsed = resumesResponseSchema.parse(list.data);
    expect(parsed.total).toBe(1);

    const created = await apiClient.post('/api/resumes', {
      applicationId: 3,
      ...resumeDocument,
    });
    const createdResume = resumeResponseSchema.parse(created.data);
    expect(createdResume.applicationId).toBe(3);

    const fetched = await apiClient.get(`/api/resumes/${createdResume.id}`);
    expect(resumeResponseSchema.parse(fetched.data).id).toBe(createdResume.id);

    const updated = await apiClient.put(`/api/resumes/${createdResume.id}`, {
      ...resumeDocument,
      summary: 'Updated summary',
    });
    expect(resumeResponseSchema.parse(updated.data).summary).toBe(
      'Updated summary',
    );

    const updatedAgain = await apiClient.put(`/api/applications/3/resume`, {
      ...resumeDocument,
      summary: 'Second update',
    });
    expect(resumeResponseSchema.parse(updatedAgain.data).summary).toBe(
      'Second update',
    );
  });

  it('rejects duplicate resumes and missing ids', async () => {
    await apiClient.post('/api/resumes', {
      applicationId: 3,
      ...resumeDocument,
    });

    await expectApiErrorCode(
      apiClient.post('/api/resumes', {
        applicationId: 3,
        ...resumeDocument,
      }),
      'conflict',
    );
    await expectApiErrorCode(apiClient.get('/api/resumes/99999'), 'not_found');
  });
});
