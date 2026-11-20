import { makeApplication } from '../../test/fixtures';
import { buildAdvanceUpdate } from './applicationActions';

const makeApp = makeApplication;

describe('buildAdvanceUpdate', () => {
  it('returns null when the status is unchanged', () => {
    expect(
      buildAdvanceUpdate(makeApp(), 'applied', { today: '2024-02-01' }),
    ).toBeNull();
  });

  it('stamps appliedAt when advancing saved to applied', () => {
    const app = makeApp({ status: 'saved', appliedAt: null });
    expect(buildAdvanceUpdate(app, 'applied', { today: '2024-02-01' })).toEqual(
      { status: 'applied', appliedAt: '2024-02-01' },
    );
  });

  it('keeps an existing appliedAt when advancing to applied', () => {
    const app = makeApp({ status: 'saved', appliedAt: '2024-01-15' });
    expect(buildAdvanceUpdate(app, 'applied', { today: '2024-02-01' })).toEqual(
      { status: 'applied' },
    );
  });

  it('does not add appliedAt for non-applied targets', () => {
    const app = makeApp({ status: 'saved', appliedAt: null });
    expect(
      buildAdvanceUpdate(app, 'screening', { today: '2024-02-01' }),
    ).toEqual({ status: 'screening' });
  });

  it('appends a dated reason note when rejecting', () => {
    const app = makeApp({ status: 'interview', notes: 'Call scheduled' });
    expect(
      buildAdvanceUpdate(app, 'rejected', {
        reason: '  Not a fit  ',
        today: '2024-02-01',
      }),
    ).toEqual({
      status: 'rejected',
      notes: 'Call scheduled\n[2024-02-01] Not a fit',
    });
  });

  it('creates a note when rejecting with no prior notes', () => {
    const app = makeApp({ status: 'offer' });
    expect(
      buildAdvanceUpdate(app, 'rejected', {
        reason: 'Salary mismatch',
        today: '2024-02-01',
      })?.notes,
    ).toBe('[2024-02-01] Salary mismatch');
  });

  it('leaves notes untouched for terminal targets without a reason', () => {
    const app = makeApp({ status: 'interview', notes: 'Keep me' });
    expect(
      buildAdvanceUpdate(app, 'withdrawn', { today: '2024-02-01' }),
    ).toEqual({ status: 'withdrawn', notes: 'Keep me' });
  });

  it('ignores blank reasons', () => {
    const app = makeApp({ status: 'interview', notes: 'Keep me' });
    expect(
      buildAdvanceUpdate(app, 'rejected', {
        reason: '   ',
        today: '2024-02-01',
      }),
    ).toEqual({ status: 'rejected', notes: 'Keep me' });
  });
});
