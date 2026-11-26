import {
  dirtyAnswerEdits,
  draftAnswersFromRun,
  groupFieldsBySection,
  missingRequiredFields,
} from './applyReview';
import type { ApplyFormField, ApplyRun } from './types/applyRun';

const field = (
  key: string,
  section: string | null = null,
  required = false,
): ApplyFormField => ({
  key,
  kind: 'text',
  label: key,
  options: [],
  required,
  section,
});

const run = (overrides: Partial<ApplyRun> = {}): ApplyRun => ({
  id: 1,
  applicationId: 1,
  jobId: 1,
  status: 'ready_for_review',
  provider: 'greenhouse',
  attempt: 1,
  formFields: [],
  proposedAnswers: {},
  artifacts: {},
  result: null,
  error: null,
  submittedAt: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('groupFieldsBySection', () => {
  it('groups fields preserving first-seen section order', () => {
    const groups = groupFieldsBySection([
      field('a', 'Personal'),
      field('b', 'Eligibility'),
      field('c', 'Personal'),
      field('d', null),
    ]);
    expect(groups.map((g) => g.section)).toEqual([
      'Personal',
      'Eligibility',
      null,
    ]);
    expect(groups[0]?.fields.map((f) => f.key)).toEqual(['a', 'c']);
    expect(groups[2]?.fields.map((f) => f.key)).toEqual(['d']);
  });

  it('returns an empty list for no fields', () => {
    expect(groupFieldsBySection([])).toEqual([]);
  });
});

const FACT_EMAIL = {
  value: 'a@b.c',
  source: 'fact',
  confidence: 1,
} as const;

/** Run with an `email` fact answer plus any extra fields. */
const runWithEmail = (extra: ApplyFormField[] = []): ApplyRun =>
  run({
    formFields: [field('email'), ...extra],
    proposedAnswers: { email: FACT_EMAIL },
  });

describe('draftAnswersFromRun', () => {
  it('seeds every field key, empty when unanswered', () => {
    const draft = draftAnswersFromRun(runWithEmail([field('phone')]));
    expect(draft).toEqual({ email: 'a@b.c', phone: '' });
  });
});

describe('dirtyAnswerEdits', () => {
  it('returns only changed entries', () => {
    const r = runWithEmail([field('phone')]);
    expect(dirtyAnswerEdits({ email: 'a@b.c', phone: '+55 11' }, r)).toEqual({
      phone: '+55 11',
    });
  });

  it('sends cleared fields as empty strings', () => {
    expect(dirtyAnswerEdits({ email: '' }, runWithEmail())).toEqual({
      email: '',
    });
  });

  it('ignores draft keys that are not form fields', () => {
    expect(
      dirtyAnswerEdits({ email: 'a@b.c', bogus: 'x' }, runWithEmail()),
    ).toEqual({});
  });
});

describe('missingRequiredFields', () => {
  it('flags required fields with no answer or a none-source answer', () => {
    const r = run({
      formFields: [field('email', null, true), field('note', null, false)],
      proposedAnswers: {
        email: { value: '', source: 'none', confidence: 0 },
      },
    });
    expect(missingRequiredFields(r).map((f) => f.key)).toEqual(['email']);
  });

  it('accepts answered required fields', () => {
    const r = run({
      formFields: [field('email', null, true)],
      proposedAnswers: {
        email: { value: 'a@b.c', source: 'fact', confidence: 1 },
      },
    });
    expect(missingRequiredFields(r)).toEqual([]);
  });
});
