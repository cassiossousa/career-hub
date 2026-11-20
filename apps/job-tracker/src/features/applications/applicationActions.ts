import {
  type Application,
  type ApplicationStatus,
  type ApplicationUpdate,
  TERMINAL_APPLICATION_STATUSES,
} from '../../services/types/application';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function appendReason(
  notes: string | null,
  reason: string | undefined,
  date: string,
): string | null {
  const trimmed = reason?.trim();
  if (!trimmed) return notes;
  const entry = `[${date}] ${trimmed}`;
  return notes ? `${notes}\n${entry}` : entry;
}

export function buildAdvanceUpdate(
  application: Application,
  target: ApplicationStatus,
  options: { reason?: string | undefined; today?: string } = {},
): ApplicationUpdate | null {
  if (application.status === target) return null;
  const today = options.today ?? todayIsoDate();
  const needsReason = TERMINAL_APPLICATION_STATUSES.has(target);
  return {
    status: target,
    ...(target === 'applied' && application.appliedAt === null
      ? { appliedAt: today }
      : {}),
    ...(needsReason
      ? {
          notes: appendReason(application.notes, options.reason, today),
        }
      : {}),
  };
}
