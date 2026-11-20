import { formatJobSalary, isJobStale, JOB_STALE_AFTER_DAYS } from './jobMeta';
import type { Job } from './types/job';

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 1,
    source: 'manual',
    externalId: null,
    url: 'https://example.com/job',
    title: 'Dev',
    company: 'Acme',
    location: 'Remote',
    area: 'frontend',
    level: 'mid',
    contractType: null,
    description: 'desc',
    remote: true,
    salaryMin: null,
    salaryMax: null,
    currency: 'BRL',
    postedAt: null,
    lastSeenAt: null,
    requirements: [],
    filterResult: 'unevaluated',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('isJobStale', () => {
  it('returns false without lastSeenAt', () => {
    expect(isJobStale(makeJob())).toBe(false);
  });

  it('returns false for recently seen jobs', () => {
    const recent = new Date(Date.now() - 86400000).toISOString();
    expect(isJobStale(makeJob({ lastSeenAt: recent }))).toBe(false);
  });

  it('returns true for jobs unseen beyond the stale threshold', () => {
    const old = new Date(
      Date.now() - (JOB_STALE_AFTER_DAYS + 1) * 86400000,
    ).toISOString();
    expect(isJobStale(makeJob({ lastSeenAt: old }))).toBe(true);
  });
});

describe('formatJobSalary', () => {
  it('returns null when no salary is set', () => {
    expect(formatJobSalary(makeJob())).toBeNull();
  });

  it('formats a min-max range', () => {
    const result = formatJobSalary(
      makeJob({ salaryMin: 1000, salaryMax: 2000, currency: 'USD' }),
    );
    expect(result).toContain('USD');
    expect(result).toContain('–');
  });

  it('formats a single bound', () => {
    expect(
      formatJobSalary(makeJob({ salaryMin: 5000, currency: 'BRL' })),
    ).toMatch(/BRL 5[.,]000/);
    expect(
      formatJobSalary(makeJob({ salaryMax: 9000, currency: 'BRL' })),
    ).toMatch(/BRL 9[.,]000/);
  });
});
