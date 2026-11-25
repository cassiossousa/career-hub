import type { Application, ApplicationStatus } from './types/application';

/** Days without a status change before an in-flight application is "stale". */
export const STALE_APPLICATION_THRESHOLD_DAYS = 21;

/** Days without a status change before an in-flight application shows a "quiet" hint. */
export const QUIET_APPLICATION_THRESHOLD_DAYS = 14;

const IN_FLIGHT_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  'applied',
  'screening',
  'interview',
]);

const MS_PER_DAY = 86_400_000;

// Single render-time reference: impure Date calls are not allowed during render,
// so staleness is measured against page-load time (same pattern as JobAgeBadge).
const DEFAULT_NOW = new Date();

function daysSince(timestamp: string, now: Date): number {
  return (now.getTime() - new Date(timestamp).getTime()) / MS_PER_DAY;
}

function isInFlight(application: Application): boolean {
  return IN_FLIGHT_STATUSES.has(application.status);
}

/** Whole days since the application entered its current status. */
export function daysInCurrentStatus(
  application: Application,
  now: Date = DEFAULT_NOW,
): number {
  return Math.floor(daysSince(application.statusChangedAt, now));
}

/** In-flight (applied/screening/interview) and silent past the stale threshold. */
export function isStaleApplication(
  application: Application,
  now: Date = DEFAULT_NOW,
): boolean {
  return (
    isInFlight(application) &&
    daysSince(application.statusChangedAt, now) >=
      STALE_APPLICATION_THRESHOLD_DAYS
  );
}

/** In-flight and silent past the quiet hint threshold (but not yet stale). */
export function isQuietApplication(
  application: Application,
  now: Date = DEFAULT_NOW,
): boolean {
  const days = daysSince(application.statusChangedAt, now);
  return (
    isInFlight(application) &&
    days >= QUIET_APPLICATION_THRESHOLD_DAYS &&
    days < STALE_APPLICATION_THRESHOLD_DAYS
  );
}
