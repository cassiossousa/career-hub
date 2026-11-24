import type { Job } from './types/job';

export const JOB_STALE_AFTER_DAYS = 14;

const renderedAtMs = Date.now();

export function jobMatchesSearch(
  job: Pick<Job, 'title' | 'company' | 'location'>,
  query: string,
): boolean {
  if (query === '') return true;
  return [job.title, job.company, job.location].some((field) =>
    field.toLowerCase().includes(query),
  );
}

export function isJobStale(job: Job): boolean {
  if (!job.lastSeenAt) return false;
  const ageMs = renderedAtMs - new Date(job.lastSeenAt).getTime();
  return ageMs > JOB_STALE_AFTER_DAYS * 86400000;
}

export function formatJobSalary(job: Job): string | null {
  const { salaryMin, salaryMax, currency } = job;
  if (salaryMin === null && salaryMax === null) return null;
  const format = (value: number) => `${currency} ${value.toLocaleString()}`;
  if (salaryMin !== null && salaryMax !== null) {
    return `${format(salaryMin)} – ${format(salaryMax)}`;
  }
  const value = salaryMin ?? salaryMax;
  return value === null ? null : format(value);
}
