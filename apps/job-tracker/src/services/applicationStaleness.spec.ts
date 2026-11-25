import {
  daysInCurrentStatus,
  isQuietApplication,
  isStaleApplication,
  QUIET_APPLICATION_THRESHOLD_DAYS,
  STALE_APPLICATION_THRESHOLD_DAYS,
} from './applicationStaleness';
import type { Application } from './types/application';

const NOW = new Date('2025-06-15T12:00:00.000Z');

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    jobId: 1,
    portfolioId: 1,
    status: 'applied',
    notes: null,
    appliedAt: '2025-06-01T00:00:00.000Z',
    statusChangedAt: '2025-06-01T00:00:00.000Z',
    createdAt: '2025-06-01T00:00:00.000Z',
    followUpAt: null,
    tags: [],
    ...overrides,
  };
}

function daysAgoIso(days: number): string {
  return new Date(NOW.getTime() - days * 86_400_000).toISOString();
}

describe('isStaleApplication', () => {
  it('flags in-flight applications silent past the threshold', () => {
    const app = makeApp({
      statusChangedAt: daysAgoIso(STALE_APPLICATION_THRESHOLD_DAYS),
    });
    expect(isStaleApplication(app, NOW)).toBe(true);
  });

  it('does not flag in-flight applications inside the threshold', () => {
    const app = makeApp({
      statusChangedAt: daysAgoIso(STALE_APPLICATION_THRESHOLD_DAYS - 1),
    });
    expect(isStaleApplication(app, NOW)).toBe(false);
  });

  it.each(['saved', 'offer', 'rejected', 'withdrawn', 'no_response'] as const)(
    'never flags %s applications',
    (status) => {
      const app = makeApp({
        status,
        statusChangedAt: daysAgoIso(365),
      });
      expect(isStaleApplication(app, NOW)).toBe(false);
    },
  );
});

describe('isQuietApplication', () => {
  it('flags in-flight applications between quiet and stale thresholds', () => {
    const app = makeApp({
      statusChangedAt: daysAgoIso(QUIET_APPLICATION_THRESHOLD_DAYS),
    });
    expect(isQuietApplication(app, NOW)).toBe(true);
  });

  it('does not flag applications already stale', () => {
    const app = makeApp({
      statusChangedAt: daysAgoIso(STALE_APPLICATION_THRESHOLD_DAYS),
    });
    expect(isQuietApplication(app, NOW)).toBe(false);
  });
});

describe('daysInCurrentStatus', () => {
  it('returns whole days since the last status change', () => {
    const app = makeApp({ statusChangedAt: daysAgoIso(10.9) });
    expect(daysInCurrentStatus(app, NOW)).toBe(10);
  });
});
