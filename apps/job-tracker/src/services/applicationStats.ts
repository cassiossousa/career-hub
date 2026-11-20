import type { Application, ApplicationStatus } from './types/application';

const DAY_MS = 86400000;

export function daysSince(iso: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY_MS));
}

const IN_FLIGHT: ReadonlySet<ApplicationStatus> = new Set([
  'applied',
  'screening',
  'interview',
]);

export interface AttentionItem {
  application: Application;
  reason: 'stale' | 'saved';
  days: number;
}

const SAVED_ATTENTION_DAYS = 7;
const STALE_ATTENTION_DAYS = 14;

export function needsAttention(
  applications: Application[],
  now = Date.now(),
): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const application of applications) {
    const days = daysSince(application.statusChangedAt, now);
    if (application.status === 'saved' && days >= SAVED_ATTENTION_DAYS) {
      items.push({ application, reason: 'saved', days });
    } else if (
      IN_FLIGHT.has(application.status) &&
      days >= STALE_ATTENTION_DAYS
    ) {
      items.push({ application, reason: 'stale', days });
    }
  }
  return items.toSorted((a, b) => b.days - a.days);
}

export function appliedThisWeek(
  applications: Application[],
  now = Date.now(),
): number {
  const weekAgo = now - 7 * DAY_MS;
  return applications.filter(
    (application) =>
      application.appliedAt !== null &&
      new Date(application.appliedAt).getTime() >= weekAgo,
  ).length;
}

export function responseRate(applications: Application[]): number | null {
  if (applications.length === 0) return null;
  const responded = applications.filter(
    (application) => application.status !== 'saved',
  ).length;
  return Math.round((responded / applications.length) * 100);
}

export function reachedInterview(applications: Application[]): number {
  return applications.filter(
    (application) =>
      application.status === 'interview' || application.status === 'offer',
  ).length;
}
