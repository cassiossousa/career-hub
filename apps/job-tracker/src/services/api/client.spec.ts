import { HttpResponse, http } from 'msw';
import { server } from '../../mocks/server';
import { expectApiErrorCode } from '../../test/apiError';
import { apiClient, isApiError, isUnreachableError } from './client';
import {
  jobResponseSchema,
  jobsResponseSchema,
  matchResponseSchema,
} from './schemas';

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
    expect(error.code).toBe('not_found');
  }
}

describe('apiClient', () => {
  it('wraps API error envelopes in ApiError', async () => {
    const error: unknown = await captureError(apiClient.get('/api/jobs/99999'));
    if (!isApiError(error)) {
      throw new Error('expected ApiError');
    }
    expect(error.code).toBe('not_found');
    expect(error.message).toBe('Job not found');
  });

  it('patches a job through the mock API', async () => {
    const response = await apiClient.patch('/api/jobs/1', {
      title: 'Updated Title',
    });
    expect(jobResponseSchema.parse(response.data).title).toBe('Updated Title');
  });

  it('returns an ApiError when patching a missing job', async () => {
    const error: unknown = await captureError(
      apiClient.patch('/api/jobs/99999', { title: 'Nope' }),
    );
    expectNotFoundError(error);
  });

  it('applies every job filter param', async () => {
    const response = await apiClient.get(
      '/api/jobs?source=gupy&level=junior&location=Remote&area=frontend&remoteOnly=true&maxAgeDays=365&preset=profile',
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
    expect(isUnreachableError(error)).toBe(true);
  });

  it('rejects with a plain Error on non-envelope HTTP errors', async () => {
    server.use(
      http.get('/api/jobs', () => new HttpResponse('oops', { status: 500 })),
    );
    const error: unknown = await captureError(apiClient.get('/api/jobs'));
    expect(isApiError(error)).toBe(false);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Request failed with status 500');
  });

  it('preserves the error code on rate-limit (429) envelopes', async () => {
    server.use(
      http.get('/api/jobs', () =>
        HttpResponse.json(
          { error: { code: 'rate_limited', message: 'Slow down' } },
          { status: 429 },
        ),
      ),
    );
    const error: unknown = await captureError(apiClient.get('/api/jobs'));
    expect(isApiError(error)).toBe(true);
    if (!isApiError(error)) {
      throw new Error('expected ApiError');
    }
    expect(error.code).toBe('rate_limited');
    expect(error.message).toBe('Slow down');
  });

  it('resolves null data for malformed JSON success bodies', async () => {
    server.use(
      http.get(
        '/api/jobs',
        () =>
          new HttpResponse('{not valid json', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );
    const response = await apiClient.get('/api/jobs');
    expect(response.data).toBeNull();
  });

  it('sends a JSON content type and serializes the request body', async () => {
    let contentType: string | null = null;
    let bodyText = '';
    server.use(
      http.post('/api/jobs', async ({ request }) => {
        contentType = request.headers.get('Content-Type');
        bodyText = await request.text();
        return HttpResponse.json({ id: 1 });
      }),
    );
    await apiClient.post('/api/jobs', { title: 'Fault Probe' });
    expect(contentType).toBe('application/json');
    const parsedBody: unknown = JSON.parse(bodyText);
    expect(parsedBody).toEqual({ title: 'Fault Probe' });
  });

  it('resolves null data for non-JSON success bodies', async () => {
    server.use(
      http.delete(
        '/api/interviews/1',
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const response = await apiClient.delete('/api/interviews/1');
    expect(response.data).toBeNull();
  });

  it('isApiError returns false for plain errors', () => {
    expect(isApiError(new Error('nope'))).toBe(false);
    expect(isApiError('string')).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });

  it('isUnreachableError only matches network failures', () => {
    expect(isUnreachableError(new Error('nope'))).toBe(false);
    expect(isUnreachableError('string')).toBe(false);
    expect(isUnreachableError(undefined)).toBe(false);
  });
});

describe('mock api parity', () => {
  const jobCreate = {
    source: 'manual',
    url: 'https://jobs.example.com/manual/parity',
    title: 'Parity Engineer',
    company: 'Parity Inc',
    location: 'Remote',
    area: 'frontend',
    level: 'mid',
  } as const;

  it('rejects duplicate job and application creates', async () => {
    await apiClient.post('/api/jobs', jobCreate);
    await expectApiErrorCode(
      apiClient.post('/api/jobs', jobCreate),
      'conflict',
    );
    await expectApiErrorCode(
      apiClient.post('/api/applications', { jobId: 1 }),
      'conflict',
    );
  });

  it('applies portfolio preset filters and location search', async () => {
    await apiClient.put('/api/portfolio', {
      locale: 'en',
      basics: {
        fullName: 'Parity User',
        headline: 'Engineer',
        subtitle: '',
        location: 'Remote',
        links: [],
      },
      filters: {
        levels: ['senior'],
        areas: ['backend'],
        locations: ['remote'],
        remoteOnly: true,
      },
    });
    const preset = await apiClient.get('/api/jobs?preset=profile&limit=10');
    expect(jobsResponseSchema.parse(preset.data).total).toBe(2);

    const located = await apiClient.get('/api/jobs?location=remote&limit=10');
    expect(jobsResponseSchema.parse(located.data).total).toBeGreaterThan(0);
  });

  it('scores a job and resume through POST /api/match', async () => {
    const response = await apiClient.post('/api/match', {
      algorithm: 'keyword',
      job: jobCreate,
      resume: {
        locale: 'en',
        summary: 'React engineer',
        basics: {
          fullName: 'Parity User',
          headline: 'Frontend Engineer',
          subtitle: '',
          location: 'Remote',
          links: [],
        },
      },
    });
    const result = matchResponseSchema.parse(response.data);
    expect(result.algorithm).toBe('keyword');
    expect(result.baseline.kind).toBe('resume');
  });

  it('locks standalone resume updates for submitted applications', async () => {
    await expectApiErrorCode(
      apiClient.put('/api/resumes/1', {
        locale: 'en',
        summary: 'Locked',
        basics: {
          fullName: 'A',
          headline: 'B',
          subtitle: '',
          location: '',
          links: [],
        },
      }),
      'resume_locked',
    );
  });
});
