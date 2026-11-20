import { makeApplication } from '../test/fixtures';
import {
  appliedThisWeek,
  daysSince,
  needsAttention,
  reachedInterview,
  responseRate,
} from './applicationStats';

const NOW = new Date('2024-06-15T12:00:00Z').getTime();

function daysAgo(days: number): string {
  return new Date(NOW - days * 86400000).toISOString();
}

const makeApp = makeApplication;

describe('daysSince', () => {
  it('returns whole days, clamped at zero', () => {
    expect(daysSince(daysAgo(3), NOW)).toBe(3);
    expect(daysSince(new Date(NOW + 86400000).toISOString(), NOW)).toBe(0);
  });
});

describe('needsAttention', () => {
  it('flags saved applications older than 7 days', () => {
    const items = needsAttention(
      [makeApp({ status: 'saved', statusChangedAt: daysAgo(10) })],
      NOW,
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.reason).toBe('saved');
    expect(items[0]?.days).toBe(10);
  });

  it('flags in-flight applications older than 14 days', () => {
    const items = needsAttention(
      [makeApp({ status: 'interview', statusChangedAt: daysAgo(20) })],
      NOW,
    );
    expect(items[0]?.reason).toBe('stale');
  });

  it('ignores fresh and terminal applications', () => {
    const items = needsAttention(
      [
        makeApp({ id: 1, status: 'applied', statusChangedAt: daysAgo(2) }),
        makeApp({ id: 2, status: 'rejected', statusChangedAt: daysAgo(30) }),
        makeApp({ id: 3, status: 'saved', statusChangedAt: daysAgo(3) }),
      ],
      NOW,
    );
    expect(items).toHaveLength(0);
  });

  it('sorts by most days first', () => {
    const items = needsAttention(
      [
        makeApp({ id: 1, status: 'saved', statusChangedAt: daysAgo(8) }),
        makeApp({ id: 2, status: 'saved', statusChangedAt: daysAgo(20) }),
      ],
      NOW,
    );
    expect(items[0]?.application.id).toBe(2);
  });
});

describe('appliedThisWeek', () => {
  it('counts applications applied within the last 7 days', () => {
    const apps = [
      makeApp({ id: 1, appliedAt: daysAgo(2) }),
      makeApp({ id: 2, appliedAt: daysAgo(10) }),
      makeApp({ id: 3, appliedAt: null, status: 'saved' }),
    ];
    expect(appliedThisWeek(apps, NOW)).toBe(1);
  });
});

describe('responseRate', () => {
  it('returns null for an empty list', () => {
    expect(responseRate([])).toBeNull();
  });

  it('returns the percentage of non-saved applications', () => {
    const apps = [
      makeApp({ id: 1, status: 'saved' }),
      makeApp({ id: 2, status: 'applied' }),
      makeApp({ id: 3, status: 'rejected' }),
      makeApp({ id: 4, status: 'saved' }),
    ];
    expect(responseRate(apps)).toBe(50);
  });
});

describe('reachedInterview', () => {
  it('counts interview and offer applications only', () => {
    const apps = [
      makeApp({ id: 1, status: 'interview' }),
      makeApp({ id: 2, status: 'offer' }),
      makeApp({ id: 3, status: 'screening' }),
      makeApp({ id: 4, status: 'applied' }),
    ];
    expect(reachedInterview(apps)).toBe(2);
  });
});
