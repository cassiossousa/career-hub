import { HttpResponse, http } from 'msw';
import { server } from '../../mocks/server';
import { apiClient, isApiError } from './client';
import { jobResponseSchema, jobsResponseSchema } from './schemas';

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  return null;
}

function expectNotFoundError(error: unknown) {
  expect(isApiError(error)).toBe(true);
  if (isApiError(error)) {
    expect(error.code).toBe('NOT_FOUND');
  }
}

describe('apiClient', () => {
  it('wraps API error envelopes in ApiError', async () => {
    const error: unknown = await captureError(apiClient.get('/api/jobs/99999'));
    expect(isApiError(error)).toBe(true);
    if (isApiError(error)) {
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Job not found');
    }
  });

  it('patches a job through the mock API', async () => {
    const response = await apiClient.patch('/api/jobs/1', {
      title: 'Updated Title',
    });
    expect(jobResponseSchema.parse(response.data).job.title).toBe(
      'Updated Title',
    );
  });

  it('returns an ApiError when patching a missing job', async () => {
    const error: unknown = await captureError(
      apiClient.patch('/api/jobs/99999', { title: 'Nope' }),
    );
    expectNotFoundError(error);
  });

  it('applies every job filter param', async () => {
    const response = await apiClient.get(
      '/api/jobs?source=gupy&level=junior&location=Remote&area=frontend&remoteOnly=true&minMatchScore=50&maxAgeDays=365&sort=match_score_asc&preset=profile',
    );
    expect(Array.isArray(jobsResponseSchema.parse(response.data).jobs)).toBe(
      true,
    );
  });

  it('returns an ApiError for a missing application', async () => {
    const error: unknown = await captureError(
      apiClient.patch('/api/applications/99999', { status: 'offer' }),
    );
    expectNotFoundError(error);
  });

  it('rejects with the raw error when there is no API envelope', async () => {
    server.use(http.get('/api/jobs', () => HttpResponse.error()));
    const error: unknown = await captureError(apiClient.get('/api/jobs'));
    expect(isApiError(error)).toBe(false);
  });

  it('isApiError returns false for plain errors', () => {
    expect(isApiError(new Error('nope'))).toBe(false);
    expect(isApiError('string')).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });
});
