import { HttpResponse, http } from 'msw';
import { skillNameKey } from '../services/skills';
import type {
  Application,
  ApplicationCreate,
  ApplicationEvent,
  ApplicationUpdate,
} from '../services/types/application';
import type {
  ApplyRun,
  ApplyRunReview,
  ProposedAnswer,
} from '../services/types/applyRun';
import type {
  ApplicationContact,
  Contact,
  ContactCreate,
} from '../services/types/contact';
import type {
  CoverLetter,
  CoverLetterUpsert,
} from '../services/types/coverLetter';
import type { ProfileFact, ProfileFactUpsert } from '../services/types/facts';
import type {
  IngestionRun,
  IngestionRunTrigger,
} from '../services/types/ingestion';
import type {
  Interview,
  InterviewCreate,
  InterviewUpdate,
} from '../services/types/interview';
import type {
  Job,
  JobCreate,
  JobFilter,
  JobPatch,
} from '../services/types/job';
import type { MatchResult } from '../services/types/match';
import type { Offer, OfferCreate, OfferUpdate } from '../services/types/offer';
import type {
  Portfolio,
  PortfolioContent,
  PortfolioDocumentWrite,
} from '../services/types/portfolio';
import type { Resume, ResumeDocument } from '../services/types/resume';
import type {
  Skill,
  SkillCreate,
  SkillGroupLabels,
  SkillPatch,
} from '../services/types/skills';
import {
  eventsForApplication,
  seedApplicationContacts,
  seedApplications,
  seedApplyArtifacts,
  seedApplyRuns,
  seedContacts,
  seedCoverLetters,
  seedIngestionRuns,
  seedInterviews,
  seedJobs,
  seedOffers,
  seedPortfolio,
  seedProfileFacts,
  seedResume,
  seedResumeDraft,
  seedSkillGroupLabels,
  seedSkills,
  toJob,
} from './data';

let jobs = [...seedJobs];
let applications = [...seedApplications];
let portfolio: Portfolio | null = { ...seedPortfolio };
let resumes: Resume[] = [seedResume, seedResumeDraft];
let skills: Skill[] = [...seedSkills];
let ingestionRuns: IngestionRun[] = [...seedIngestionRuns];
let nextIngestionRunId = 100;
let skillGroupLabels: SkillGroupLabels[] = seedSkillGroupLabels.map(
  (entry) => ({
    ...entry,
    labels: { ...entry.labels },
  }),
);
let nextJobId = 100;
let nextApplicationId = 100;
let nextResumeId = 100;
let nextSkillId = 100;
let interviews: Interview[] = [...seedInterviews];
let contacts: Contact[] = [...seedContacts];
let applicationContacts = [...seedApplicationContacts];
let offers: Offer[] = [...seedOffers];
let coverLetters: CoverLetter[] = [...seedCoverLetters];
let profileFacts: ProfileFact[] = [...seedProfileFacts];
let applyRuns: ApplyRun[] = [...seedApplyRuns];
let redraftSeq = 0;
const applyArtifactTexts = new Map<
  string,
  { contentType: string; text: string }
>(Object.entries(seedApplyArtifacts));
let nextApplyRunId = 100;
const applicationEvents = new Map<number, ApplicationEvent[]>();
let nextInterviewId = 100;
let nextContactId = 100;
let nextOfferId = 100;
let nextCoverLetterId = 100;
let nextEventId = 1000;

function eventsForApp(applicationId: number): ApplicationEvent[] {
  const cached = applicationEvents.get(applicationId);
  if (cached !== undefined) return cached;
  const app = applications.find((a) => a.id === applicationId);
  const events =
    app === undefined ? [] : eventsForApplication(app, applicationId * 100);
  applicationEvents.set(applicationId, events);
  return events;
}

function pushAppEvent(
  applicationId: number,
  kind: ApplicationEvent['kind'],
  payload: Record<string, unknown>,
) {
  const events = eventsForApp(applicationId);
  events.push({
    id: nextEventId++,
    kind,
    payload,
    createdAt: new Date().toISOString(),
  });
}

function recordApplicationPatchEvents(
  app: Application,
  before: Application,
  body: ApplicationUpdate,
) {
  if (body.status !== undefined && body.status !== before.status) {
    pushAppEvent(app.id, 'status_changed', {
      from: before.status,
      to: app.status,
    });
  }
  if (body.notes !== undefined && body.notes !== before.notes) {
    pushAppEvent(app.id, 'note_added', {});
  }
  if (body.followUpAt !== undefined && body.followUpAt !== before.followUpAt) {
    pushAppEvent(
      app.id,
      body.followUpAt === null ? 'follow_up_cleared' : 'follow_up_set',
      body.followUpAt === null ? {} : { at: body.followUpAt },
    );
  }
}

export function resetMockData() {
  jobs = [...seedJobs];
  applications = [...seedApplications];
  portfolio = { ...seedPortfolio };
  resumes = [seedResume, seedResumeDraft];
  skills = [...seedSkills];
  ingestionRuns = [...seedIngestionRuns];
  interviews = [...seedInterviews];
  contacts = [...seedContacts];
  applicationContacts = [...seedApplicationContacts];
  offers = [...seedOffers];
  coverLetters = [...seedCoverLetters];
  profileFacts = [...seedProfileFacts];
  applyRuns = [...seedApplyRuns];
  redraftSeq = 0;
  applyArtifactTexts.clear();
  for (const [key, value] of Object.entries(seedApplyArtifacts)) {
    applyArtifactTexts.set(key, value);
  }
  nextApplyRunId = 100;
  applicationEvents.clear();
  nextIngestionRunId = 100;
  skillGroupLabels = seedSkillGroupLabels.map((entry) => ({
    ...entry,
    labels: { ...entry.labels },
  }));
  nextJobId = 100;
  nextApplicationId = 100;
  nextResumeId = 100;
  nextSkillId = 100;
  nextInterviewId = 100;
  nextContactId = 100;
  nextOfferId = 100;
  nextCoverLetterId = 100;
  nextEventId = 1000;
}

function ageInDays(postedAt: string | null): number {
  if (!postedAt) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(postedAt).getTime()) / 86400000;
}

const notFoundJson = (message: string) =>
  HttpResponse.json({ error: { code: 'not_found', message } }, { status: 404 });

const conflictJson = (code: string, message: string) =>
  HttpResponse.json({ error: { code, message } }, { status: 409 });

function withApplication(job: Job): Job {
  const app = applications.find((a) => a.jobId === job.id);
  return {
    ...job,
    applicationId: app?.id ?? null,
    applicationStatus: app?.status ?? null,
  };
}

function applyProfilePreset(result: Job[], rules: Portfolio['filters']): Job[] {
  const levels = rules.levels ?? [];
  const areas = rules.areas ?? [];
  const locations = rules.locations ?? [];
  if (levels.length > 0)
    result = result.filter((j) => levels.includes(j.level));
  if (areas.length > 0) result = result.filter((j) => areas.includes(j.area));
  if (locations.length > 0)
    result = result.filter((j) =>
      locations.some((loc) =>
        j.location.toLowerCase().includes(loc.toLowerCase()),
      ),
    );
  if (rules.remoteOnly) result = result.filter((j) => j.remote);
  return result;
}

function filterJobs(filter: JobFilter): Job[] {
  let result = [...jobs];
  if (filter.source) result = result.filter((j) => j.source === filter.source);
  if (filter.level) result = result.filter((j) => j.level === filter.level);
  const locationNeedle = filter.location?.toLowerCase();
  if (locationNeedle)
    result = result.filter((j) =>
      j.location.toLowerCase().includes(locationNeedle),
    );
  if (filter.area) result = result.filter((j) => j.area === filter.area);
  if (filter.remoteOnly) result = result.filter((j) => j.remote);
  if (filter.preset === 'profile' && portfolio !== null) {
    result = applyProfilePreset(result, portfolio.filters);
  }
  const maxAgeDays = filter.maxAgeDays;
  if (maxAgeDays !== undefined)
    result = result.filter((j) => ageInDays(j.postedAt) <= maxAgeDays);

  return result.toSorted(
    (a, b) =>
      new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime(),
  );
}

function pageOf<T>(
  items: T[],
  params: URLSearchParams,
): { items: T[]; total: number } {
  const limit = Math.min(Math.max(Number(params.get('limit')) || 50, 1), 200);
  const offset = Math.max(Number(params.get('offset')) || 0, 0);
  return { items: items.slice(offset, offset + limit), total: items.length };
}

function ageBucket(days: number): string {
  if (days === Number.POSITIVE_INFINITY) return 'unknown';
  if (days < 1) return '<1d';
  if (days < 7) return '1-7d';
  if (days < 30) return '7-30d';
  return '>30d';
}

function jobStats() {
  const filtered: Record<string, number> = {
    unevaluated: 0,
    passed: 0,
    filtered_level: 0,
    filtered_location: 0,
    filtered_area: 0,
    filtered_remote: 0,
    filtered_age: 0,
  };
  for (const j of jobs)
    filtered[j.filterResult] = (filtered[j.filterResult] ?? 0) + 1;
  const countBy = (key: (j: (typeof jobs)[number]) => string) => {
    const acc: Record<string, number> = {};
    for (const j of jobs) acc[key(j)] = (acc[key(j)] ?? 0) + 1;
    return acc;
  };
  const jobsByAge: Record<string, number> = {};
  for (const j of jobs) {
    const b = ageBucket(ageInDays(j.postedAt));
    jobsByAge[b] = (jobsByAge[b] ?? 0) + 1;
  }
  const appsByStatus: Record<string, number> = {};
  for (const a of applications) {
    appsByStatus[a.status] = (appsByStatus[a.status] ?? 0) + 1;
  }
  return {
    total: jobs.length,
    bySource: countBy((j) => j.source),
    byLevel: countBy((j) => j.level),
    byArea: countBy((j) => j.area),
    filtered,
    applicationsByStatus: appsByStatus,
    jobsByAge,
  };
}

function docSearchText(content: PortfolioContent | ResumeDocument): string {
  const parts: string[] = [
    content.basics.fullName,
    content.basics.headline ?? '',
    content.basics.subtitle ?? '',
    ...(content.basics.links ?? []).map((l) => l.url),
  ];
  for (const group of content.skillGroups ?? []) {
    parts.push(group.category, ...(group.items ?? []));
  }
  for (const exp of content.experience ?? []) {
    parts.push(exp.company, exp.role, exp.location ?? '');
    for (const bullet of exp.bullets ?? []) {
      parts.push(bullet.text, ...(bullet.skills ?? []));
    }
  }
  for (const project of content.projects ?? []) {
    parts.push(project.title, project.summary, ...(project.technologies ?? []));
  }
  return parts.join(' ').toLowerCase();
}

function computeMatch(
  job: Job,
  baselineDoc: PortfolioContent | ResumeDocument,
  algorithm: string,
  baseline: MatchResult['baseline'],
): MatchResult {
  const haystack = docSearchText(baselineDoc);
  const requirementMatches = job.requirements.map((req) => {
    const tokens = req.text
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter(Boolean);
    const matched = tokens.some((token) => haystack.includes(token));
    return {
      text: req.text,
      weight: req.weight ?? 5,
      matched,
      score: matched ? 100 : 0,
    };
  });
  const totalWeight = requirementMatches.reduce((s, r) => s + r.weight, 0);
  const matchedWeight = requirementMatches
    .filter((r) => r.matched)
    .reduce((s, r) => s + r.weight, 0);
  const score =
    totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  const matchedTerms = requirementMatches
    .filter((r) => r.matched)
    .map((r) => r.text);
  const missingTerms = requirementMatches
    .filter((r) => !r.matched)
    .map((r) => r.text);
  return {
    score,
    algorithm: (['keyword', 'tfidf', 'hybrid'].includes(algorithm)
      ? algorithm
      : 'hybrid') as MatchResult['algorithm'],
    baseline,
    components: {
      keyword: score,
      tfidf: score,
      skill_coverage: score,
    },
    matchedTerms,
    missingTerms,
    requirements: requirementMatches,
  };
}

function portfolioBaselineDoc(): {
  doc: PortfolioContent;
  locale: string;
} | null {
  if (portfolio === null) return null;
  const locales = Object.keys(portfolio.documents).toSorted();
  const locale = locales.includes('en') ? 'en' : (locales[0] ?? 'en');
  const doc = portfolio.documents[locale];
  return doc === undefined ? null : { doc, locale };
}

function matchJobById(
  jobId: number,
  algorithm: string,
  applicationId: number | undefined,
): MatchResult | ReturnType<typeof notFoundJson> {
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return notFoundJson('Job not found');

  let baselineDoc: PortfolioContent | ResumeDocument | null = null;
  let baseline: MatchResult['baseline'] = {
    kind: 'portfolio',
    locale: null,
    applicationId: null,
  };

  if (applicationId !== undefined) {
    const application = applications.find((a) => a.id === applicationId);
    if (!application) return notFoundJson('Application not found');
    const resume = resumes.find((r) => r.applicationId === applicationId);
    if (resume) {
      baselineDoc = resume;
      baseline = {
        kind: 'resume',
        locale: resume.locale,
        applicationId,
      };
    }
  }

  if (baselineDoc === null) {
    const resolved = portfolioBaselineDoc();
    if (resolved === null) return notFoundJson('Portfolio not found');
    baselineDoc = resolved.doc;
    baseline = {
      kind: 'portfolio',
      locale: resolved.locale,
      applicationId: null,
    };
  }

  return computeMatch(job, baselineDoc, algorithm, baseline);
}

function findApplication(id: number): Application | Response {
  return (
    applications.find((a) => a.id === id) ??
    notFoundJson('Application not found')
  );
}

function applicationResume(applicationId: number): Resume | undefined {
  return resumes.find((r) => r.applicationId === applicationId);
}

function resumeLocked(applicationId: number): boolean {
  const application = applications.find((a) => a.id === applicationId);
  return application === undefined || application.status !== 'saved';
}

function documentFromBody(body: ResumeDocument): ResumeDocument {
  return {
    locale: body.locale,
    summary: body.summary,
    basics: body.basics,
    experience: body.experience ?? [],
    education: body.education ?? [],
    certifications: body.certifications ?? [],
    languages: body.languages ?? [],
    projects: body.projects ?? [],
    skillGroups: body.skillGroups ?? [],
  };
}

const INGESTION_SOURCES: Job['source'][] = [
  'remote',
  'solides',
  'empregos_com_br',
  'sine_bahia',
  'casa_do_trabalhador',
  'gupy',
  'google_jobs',
];

const INGESTION_FAILURES: Partial<Record<Job['source'], string>> = {
  sine_bahia: 'sine_bahia: candidate-login-gated portal; no public feed',
  gupy: 'gupy: per-company career pages; needs a configured company list',
  google_jobs:
    'google_jobs: requires a configured Google Cloud API key (not enabled)',
};

function mockIngestionRun(source: Job['source']): IngestionRun {
  const now = new Date().toISOString();
  const error = INGESTION_FAILURES[source];
  const ok = error === undefined;
  return {
    id: nextIngestionRunId++,
    startedAt: now,
    finishedAt: now,
    createdAt: now,
    source,
    status: ok ? 'succeeded' : 'failed',
    fetched: ok ? 25 : 0,
    inserted: ok ? 3 : 0,
    updated: ok ? 22 : 0,
    failed: 0,
    error: error ?? null,
  };
}

const ACTIVE_APPLY_STATUSES: ReadonlySet<ApplyRun['status']> = new Set([
  'queued',
  'inspecting',
  'ready_for_review',
  'approved',
  'submitting',
  'needs_human',
]);

/** Simulates the apply worker draining the queue on read (demo mode). */
function drainApplyRuns() {
  const template = seedApplyRuns[0];
  if (template === undefined) return;
  const now = new Date().toISOString();
  applyRuns = applyRuns.map((run) => {
    if (run.status === 'queued' || run.status === 'inspecting') {
      const inspected: ApplyRun = {
        ...run,
        status: 'ready_for_review',
        attempt: run.attempt + 1,
        formFields: template.formFields,
        proposedAnswers: { ...template.proposedAnswers },
        artifacts: { ...template.artifacts },
        updatedAt: now,
      };
      for (const name of Object.keys(inspected.artifacts)) {
        const canned = applyArtifactTexts.get(`1:${name}`);
        if (canned !== undefined) {
          applyArtifactTexts.set(`${inspected.id}:${name}`, canned);
        }
      }
      return inspected;
    }
    if (run.status === 'approved') {
      const application = applications.find((a) => a.id === run.applicationId);
      if (application !== undefined && application.status === 'saved') {
        application.status = 'applied';
        application.appliedAt = now.slice(0, 10);
        application.statusChangedAt = now;
        pushAppEvent(application.id, 'status_changed', {
          from: 'saved',
          to: 'applied',
        });
      }
      pushAppEvent(run.applicationId, 'apply_submitted', { run_id: run.id });
      return {
        ...run,
        status: 'submitted',
        submittedAt: now,
        result: { confirmation: 'mock-submit-ok' },
        updatedAt: now,
      };
    }
    return run;
  });
}

function findApplyRun(id: number): ApplyRun | Response {
  drainApplyRuns();
  const run = applyRuns.find((r) => r.id === id);
  return run ?? notFoundJson('Apply run not found');
}

function applyReviewError(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

function approveApplyRun(run: ApplyRun, now: string): ApplyRun | Response {
  if (run.status !== 'ready_for_review') {
    return conflictJson('invalid_transition', 'Run is not ready for review');
  }
  const missing = run.formFields.filter(
    (f) =>
      f.required &&
      (run.proposedAnswers[f.key] === undefined ||
        run.proposedAnswers[f.key]?.source === 'none'),
  );
  if (missing.length > 0) {
    return applyReviewError(
      422,
      'validation_failed',
      `required fields unanswered: ${missing.map((f) => f.key).join(', ')}`,
    );
  }
  for (const field of run.formFields) {
    const answer = run.proposedAnswers[field.key];
    if (field.options.length === 0 || answer === undefined) continue;
    const invalid = answer.value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => !field.options.includes(part));
    if (invalid.length > 0) {
      return applyReviewError(
        422,
        'validation_failed',
        `answer for '${field.key}' is not one of the allowed options`,
      );
    }
  }
  pushAppEvent(run.applicationId, 'apply_approved', { run_id: run.id });
  return { ...run, status: 'approved', updatedAt: now };
}

function collectAnswerEdits(
  run: ApplyRun,
  answers: Record<string, string>,
): Map<string, string> | Response {
  const known = new Set(run.formFields.map((f) => f.key));
  const edits = new Map<string, string>();
  for (const [key, value] of Object.entries(answers)) {
    if (!known.has(key)) {
      return applyReviewError(
        422,
        'validation_failed',
        `unknown form field '${key}'`,
      );
    }
    edits.set(key, value.trim());
  }
  return edits;
}

const manualAnswer = (value: string): ProposedAnswer => ({
  value,
  source: 'manual',
  confidence: 1,
});

function mergeAnswerEdits(
  run: ApplyRun,
  edits: Map<string, string>,
): Record<string, ProposedAnswer> {
  const proposedAnswers: Record<string, ProposedAnswer> = {};
  for (const [key, answer] of Object.entries(run.proposedAnswers)) {
    const edit = edits.get(key);
    if (edit === '') continue;
    proposedAnswers[key] = edit === undefined ? answer : manualAnswer(edit);
  }
  for (const [key, edit] of edits) {
    if (edit !== '' && run.proposedAnswers[key] === undefined) {
      proposedAnswers[key] = manualAnswer(edit);
    }
  }
  return proposedAnswers;
}

function editApplyRun(
  run: ApplyRun,
  answers: Record<string, string> | null | undefined,
  now: string,
): ApplyRun | Response {
  const hadAnswers = answers !== undefined && answers !== null;
  const editable =
    run.status === 'ready_for_review' ||
    (run.status === 'needs_human' && hadAnswers);
  if (!editable) {
    return conflictJson('invalid_transition', 'Run cannot be edited');
  }
  const edits = collectAnswerEdits(run, answers ?? {});
  if (edits instanceof Response) return edits;
  return {
    ...run,
    status: hadAnswers ? 'ready_for_review' : run.status,
    proposedAnswers: mergeAnswerEdits(run, edits),
    error: null,
    updatedAt: now,
  };
}

function nextRunForReview(
  run: ApplyRun,
  body: ApplyRunReview,
  now: string,
): ApplyRun | Response {
  if (body.action === 'approve') return approveApplyRun(run, now);
  if (body.action === 'reject') {
    if (run.status !== 'ready_for_review' && run.status !== 'needs_human') {
      return conflictJson('invalid_transition', 'Run cannot be rejected');
    }
    pushAppEvent(run.applicationId, 'apply_rejected', { run_id: run.id });
    return { ...run, status: 'skipped', updatedAt: now };
  }
  if (body.action === 'retry') {
    if (run.status !== 'failed' && run.status !== 'needs_human') {
      return conflictJson('invalid_transition', 'Run cannot be retried');
    }
    return { ...run, status: 'queued', error: null, updatedAt: now };
  }
  return editApplyRun(run, body.answers, now);
}

const REDRAFT_TEXTS = [
  'I am excited about this opportunity and would love to contribute my experience to the team.',
  'This role aligns closely with my background, and I am eager to bring my skills to your company.',
  'I believe my experience makes me a strong fit, and I would welcome the chance to discuss it further.',
];

function redraftApplyRun(run: ApplyRun, now: string): ApplyRun | Response {
  const editable =
    run.status === 'ready_for_review' ||
    (run.status === 'needs_human' && run.formFields.length > 0);
  if (!editable) {
    return conflictJson('invalid_transition', 'Run cannot be redrafted');
  }
  const answers = { ...run.proposedAnswers };
  for (const [key, answer] of Object.entries(answers)) {
    if (answer.source !== 'ai') continue;
    redraftSeq += 1;
    answers[key] = {
      ...answer,
      value:
        REDRAFT_TEXTS[redraftSeq % REDRAFT_TEXTS.length] ??
        REDRAFT_TEXTS[0] ??
        '',
      confidence: 0.6,
    };
  }
  return { ...run, proposedAnswers: answers, updatedAt: now };
}

function applyRunReview(
  run: ApplyRun,
  body: ApplyRunReview,
): ApplyRun | Response {
  const next = nextRunForReview(run, body, new Date().toISOString());
  if (next instanceof Response) return next;
  applyRuns = applyRuns.map((r) => (r.id === run.id ? next : r));
  return next;
}

export const handlers = [
  http.get('/api/ingestion/runs', ({ request }) => {
    const { items, total } = pageOf(
      ingestionRuns.toSorted((a, b) => b.id - a.id),
      new URL(request.url).searchParams,
    );
    return HttpResponse.json({ runs: items, total });
  }),

  http.post('/api/ingestion/runs', async ({ request }) => {
    const body = (await request.json()) as IngestionRunTrigger;
    const sources =
      body.source !== undefined && body.source !== null
        ? [body.source]
        : INGESTION_SOURCES;
    const created = sources.map(mockIngestionRun);
    ingestionRuns = [...created, ...ingestionRuns];
    return HttpResponse.json(
      { runs: created, total: created.length },
      { status: 201 },
    );
  }),

  http.get('/api/jobs/stats', () => HttpResponse.json(jobStats())),

  http.get('/api/jobs', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const filter: JobFilter = {
      source: (params.get('source') as JobFilter['source']) ?? undefined,
      level: (params.get('level') as JobFilter['level']) ?? undefined,
      location: params.get('location') ?? undefined,
      area: (params.get('area') as JobFilter['area']) ?? undefined,
      remoteOnly:
        params.get('remoteOnly') === null
          ? undefined
          : params.get('remoteOnly') === 'true',
      maxAgeDays: params.get('maxAgeDays')
        ? Number(params.get('maxAgeDays'))
        : undefined,
      preset: (params.get('preset') as JobFilter['preset']) ?? undefined,
    };
    const { items, total } = pageOf(filterJobs(filter), params);
    return HttpResponse.json({ jobs: items.map(withApplication), total });
  }),

  http.post('/api/jobs', async ({ request }) => {
    const body = (await request.json()) as JobCreate;
    const duplicate = jobs.find(
      (j) =>
        j.url === body.url ||
        (body.externalId != null &&
          j.source === body.source &&
          j.externalId === body.externalId),
    );
    if (duplicate) {
      return conflictJson('conflict', 'Job already exists');
    }
    const job = toJob(body, nextJobId++);
    jobs.push(job);
    return HttpResponse.json(withApplication(job), { status: 201 });
  }),

  http.get('/api/jobs/:id/match', ({ params, request }) => {
    const query = new URL(request.url).searchParams;
    const algorithm = query.get('algorithm') ?? 'hybrid';
    const applicationIdParam = query.get('applicationId');
    const applicationId =
      applicationIdParam === null ? undefined : Number(applicationIdParam);
    const result = matchJobById(Number(params.id), algorithm, applicationId);
    if (result instanceof Response) return result;
    return HttpResponse.json(result);
  }),

  http.get('/api/jobs/:id', ({ params }) => {
    const job = jobs.find((j) => j.id === Number(params.id));
    if (!job) {
      return notFoundJson('Job not found');
    }
    return HttpResponse.json(withApplication(job));
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    const job = jobs.find((j) => j.id === Number(params.id));
    if (!job) {
      return notFoundJson('Job not found');
    }
    const body = (await request.json()) as JobPatch;
    Object.assign(job, body);
    return HttpResponse.json(withApplication(job));
  }),

  http.get('/api/applications', ({ request }) => {
    const params = new URL(request.url).searchParams;
    let result = [...applications];
    const status = params.get('status');
    const jobId = params.get('jobId');
    const followUp = params.get('followUp');
    const tag = params.get('tag');
    if (status) result = result.filter((a) => a.status === status);
    if (jobId) result = result.filter((a) => a.jobId === Number(jobId));
    if (tag) result = result.filter((a) => a.tags.includes(tag));
    if (followUp === 'due' || followUp === 'upcoming') {
      const now = Date.now();
      result = result.filter((a) => {
        if (a.followUpAt === null) return false;
        const at = new Date(a.followUpAt).getTime();
        return followUp === 'due' ? at <= now : at > now;
      });
    }
    const { items, total } = pageOf(result, params);
    return HttpResponse.json({ applications: items, total });
  }),

  http.post('/api/applications', async ({ request }) => {
    const body = (await request.json()) as ApplicationCreate;
    if (applications.some((a) => a.jobId === body.jobId)) {
      return conflictJson('conflict', 'Application already exists');
    }
    const now = new Date().toISOString();
    const app = {
      id: nextApplicationId++,
      status: body.status ?? 'saved',
      notes: body.notes ?? null,
      appliedAt: body.appliedAt ?? null,
      followUpAt: body.followUpAt ?? null,
      tags: body.tags ?? [],
      portfolioId: portfolio?.id ?? 1,
      statusChangedAt: now,
      createdAt: now,
      jobId: body.jobId,
    };
    applications.push(app);
    eventsForApp(app.id);
    pushAppEvent(app.id, 'created', { status: app.status });
    return HttpResponse.json(app, { status: 201 });
  }),

  http.get('/api/applications/:id/events', ({ params, request }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const sorted = eventsForApp(app.id).toSorted(
      (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
    );
    const { items, total } = pageOf(sorted, new URL(request.url).searchParams);
    return HttpResponse.json({ events: items, total });
  }),

  http.get('/api/applications/:id', ({ params }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    return HttpResponse.json(app);
  }),

  http.patch('/api/applications/:id', async ({ params, request }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const before = { ...app };
    const body = (await request.json()) as ApplicationUpdate;
    Object.assign(app, body, { statusChangedAt: new Date().toISOString() });
    recordApplicationPatchEvents(app, before, body);
    return HttpResponse.json(app);
  }),

  http.get('/api/applications/:id/match', ({ params, request }) => {
    const applicationId = Number(params.id);
    const application = findApplication(applicationId);
    if (application instanceof Response) return application;
    const algorithm =
      new URL(request.url).searchParams.get('algorithm') ?? 'hybrid';
    const result = matchJobById(application.jobId, algorithm, applicationId);
    if (result instanceof Response) return result;
    return HttpResponse.json(result);
  }),

  http.get('/api/applications/:id/resume', ({ params }) => {
    const resume = applicationResume(Number(params.id));
    if (!resume) {
      return notFoundJson('Resume not found');
    }
    return HttpResponse.json(resume);
  }),

  http.put('/api/applications/:id/resume', async ({ params, request }) => {
    const applicationId = Number(params.id);
    const application = findApplication(applicationId);
    if (application instanceof Response) return application;
    if (resumeLocked(applicationId)) {
      return conflictJson('resume_locked', 'Resume is locked');
    }
    const body = (await request.json()) as ResumeDocument;
    const existing = applicationResume(applicationId);
    const now = new Date().toISOString();
    const resume: Resume = {
      id: existing?.id ?? nextResumeId++,
      applicationId,
      ...documentFromBody(body),
      submittedAt: existing?.submittedAt ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    if (existing) {
      resumes = resumes.map((r) => (r.id === resume.id ? resume : r));
    } else {
      resumes.push(resume);
    }
    return HttpResponse.json(resume);
  }),

  http.get('/api/applications/:id/interviews', ({ params, request }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const result = interviews
      .filter((i) => i.applicationId === app.id)
      .toSorted((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    const { items, total } = pageOf(result, new URL(request.url).searchParams);
    return HttpResponse.json({ interviews: items, total });
  }),

  http.post('/api/applications/:id/interviews', async ({ params, request }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const body = (await request.json()) as InterviewCreate;
    const now = new Date().toISOString();
    const interview: Interview = {
      id: nextInterviewId++,
      applicationId: app.id,
      mode: body.mode ?? 'video',
      outcome: body.outcome ?? 'pending',
      scheduledAt: body.scheduledAt,
      durationMinutes: body.durationMinutes ?? null,
      roundLabel: body.roundLabel ?? null,
      location: body.location ?? null,
      notes: body.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    interviews.push(interview);
    return HttpResponse.json(interview, { status: 201 });
  }),

  http.patch('/api/interviews/:id', async ({ params, request }) => {
    const interview = interviews.find((i) => i.id === Number(params.id));
    if (!interview) {
      return notFoundJson('Interview not found');
    }
    const body = (await request.json()) as InterviewUpdate;
    Object.assign(interview, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(interview);
  }),

  http.delete('/api/interviews/:id', ({ params }) => {
    const index = interviews.findIndex((i) => i.id === Number(params.id));
    if (index === -1) {
      return notFoundJson('Interview not found');
    }
    interviews.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/contacts', ({ request }) => {
    const { items, total } = pageOf(
      contacts.toSorted((a, b) => a.name.localeCompare(b.name)),
      new URL(request.url).searchParams,
    );
    return HttpResponse.json({ contacts: items, total });
  }),

  http.post('/api/contacts', async ({ request }) => {
    const body = (await request.json()) as ContactCreate;
    const now = new Date().toISOString();
    const contact: Contact = {
      id: nextContactId++,
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      company: body.company ?? null,
      role: body.role ?? null,
      notes: body.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    contacts.push(contact);
    return HttpResponse.json(contact, { status: 201 });
  }),

  http.get('/api/applications/:id/contacts', ({ params }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const result: ApplicationContact[] = applicationContacts
      .filter((link) => link.applicationId === app.id)
      .flatMap((link) => {
        const contact = contacts.find((c) => c.id === link.contactId);
        return contact === undefined
          ? []
          : [
              {
                applicationId: app.id,
                contact,
                isPrimary: link.isPrimary,
              },
            ];
      });
    return HttpResponse.json(result);
  }),

  http.post(
    '/api/applications/:id/contacts/:contactId',
    ({ params, request }) => {
      const app = findApplication(Number(params.id));
      if (app instanceof Response) return app;
      const contactId = Number(params.contactId);
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) {
        return notFoundJson('Contact not found');
      }
      if (
        applicationContacts.some(
          (link) =>
            link.applicationId === app.id && link.contactId === contactId,
        )
      ) {
        return conflictJson('conflict', 'Contact already linked');
      }
      const primary =
        new URL(request.url).searchParams.get('primary') === 'true';
      applicationContacts.push({
        applicationId: app.id,
        contactId,
        isPrimary: primary,
      });
      return HttpResponse.json(
        { applicationId: app.id, contact, isPrimary: primary },
        { status: 201 },
      );
    },
  ),

  http.delete('/api/applications/:id/contacts/:contactId', ({ params }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const contactId = Number(params.contactId);
    const index = applicationContacts.findIndex(
      (link) => link.applicationId === app.id && link.contactId === contactId,
    );
    if (index === -1) {
      return notFoundJson('Contact link not found');
    }
    applicationContacts.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/applications/:id/offers', ({ params, request }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const result = offers.filter((o) => o.applicationId === app.id);
    const { items, total } = pageOf(result, new URL(request.url).searchParams);
    return HttpResponse.json({ offers: items, total });
  }),

  http.post('/api/applications/:id/offers', async ({ params, request }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const body = (await request.json()) as OfferCreate;
    const now = new Date().toISOString();
    const offer: Offer = {
      id: nextOfferId++,
      applicationId: app.id,
      status: body.status ?? 'received',
      currency: body.currency.toUpperCase(),
      salaryMin: body.salaryMin ?? null,
      salaryMax: body.salaryMax ?? null,
      equityNotes: body.equityNotes ?? null,
      benefitsNotes: body.benefitsNotes ?? null,
      decidedAt: body.decidedAt ?? null,
      notes: body.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    offers.push(offer);
    return HttpResponse.json(offer, { status: 201 });
  }),

  http.patch('/api/offers/:id', async ({ params, request }) => {
    const offer = offers.find((o) => o.id === Number(params.id));
    if (!offer) {
      return notFoundJson('Offer not found');
    }
    const body = (await request.json()) as OfferUpdate;
    Object.assign(offer, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(offer);
  }),

  http.delete('/api/offers/:id', ({ params }) => {
    const index = offers.findIndex((o) => o.id === Number(params.id));
    if (index === -1) {
      return notFoundJson('Offer not found');
    }
    offers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/applications/:id/cover-letter', ({ params }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const letter = coverLetters.find((l) => l.applicationId === app.id);
    if (!letter) {
      return notFoundJson('Cover letter not found');
    }
    return HttpResponse.json(letter);
  }),

  http.put(
    '/api/applications/:id/cover-letter',
    async ({ params, request }) => {
      const app = findApplication(Number(params.id));
      if (app instanceof Response) return app;
      const body = (await request.json()) as CoverLetterUpsert;
      const now = new Date().toISOString();
      const existing = coverLetters.find((l) => l.applicationId === app.id);
      const letter: CoverLetter = {
        id: existing?.id ?? nextCoverLetterId++,
        applicationId: app.id,
        locale: body.locale,
        subject: body.subject ?? null,
        bodyText: body.bodyText,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      if (existing) {
        coverLetters = coverLetters.map((l) =>
          l.id === letter.id ? letter : l,
        );
      } else {
        coverLetters.push(letter);
      }
      return HttpResponse.json(letter);
    },
  ),

  http.delete('/api/applications/:id/cover-letter', ({ params }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const index = coverLetters.findIndex((l) => l.applicationId === app.id);
    if (index === -1) {
      return notFoundJson('Cover letter not found');
    }
    coverLetters.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/match', async ({ request }) => {
    const body = (await request.json()) as {
      algorithm?: string;
      job: JobCreate;
      resume: ResumeDocument;
    };
    const job = toJob(body.job, 0);
    const result = computeMatch(
      job,
      documentFromBody(body.resume),
      body.algorithm ?? 'hybrid',
      { kind: 'resume', locale: body.resume.locale, applicationId: null },
    );
    return HttpResponse.json(result);
  }),

  http.get('/api/resumes', ({ request }) => {
    const { items, total } = pageOf(
      resumes.toSorted((a, b) => b.id - a.id),
      new URL(request.url).searchParams,
    );
    return HttpResponse.json({ resumes: items, total });
  }),

  http.post('/api/resumes', async ({ request }) => {
    const body = (await request.json()) as ResumeDocument & {
      applicationId: number;
    };
    if (applicationResume(body.applicationId)) {
      return conflictJson('conflict', 'Resume already exists');
    }
    const now = new Date().toISOString();
    const resume: Resume = {
      id: nextResumeId++,
      applicationId: body.applicationId,
      ...documentFromBody(body),
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    resumes.push(resume);
    return HttpResponse.json(resume, { status: 201 });
  }),

  http.get('/api/resumes/:id', ({ params }) => {
    const resume = resumes.find((r) => r.id === Number(params.id));
    if (!resume) {
      return notFoundJson('Resume not found');
    }
    return HttpResponse.json(resume);
  }),

  http.put('/api/resumes/:id', async ({ params, request }) => {
    const resume = resumes.find((r) => r.id === Number(params.id));
    if (!resume) {
      return notFoundJson('Resume not found');
    }
    if (resumeLocked(resume.applicationId)) {
      return conflictJson('resume_locked', 'Resume is locked');
    }
    const body = (await request.json()) as ResumeDocument;
    const updated: Resume = {
      ...resume,
      ...documentFromBody(body),
      updatedAt: new Date().toISOString(),
    };
    resumes = resumes.map((r) => (r.id === updated.id ? updated : r));
    return HttpResponse.json(updated);
  }),

  http.get('/api/portfolio', () => {
    if (portfolio === null) {
      return notFoundJson('Portfolio not found');
    }
    return HttpResponse.json(portfolio);
  }),

  http.put('/api/portfolio', async ({ request }) => {
    const body = (await request.json()) as PortfolioDocumentWrite;
    const now = new Date().toISOString();
    const content: PortfolioContent = {
      basics: body.basics,
      experience: body.experience ?? [],
      skillGroups: body.skillGroups ?? [],
      projects: body.projects ?? [],
      languages: body.languages ?? [],
    };
    portfolio = {
      id: portfolio?.id ?? 1,
      filters: body.filters ??
        portfolio?.filters ?? {
          levels: [],
          areas: [],
          locations: [],
          remoteOnly: false,
        },
      documents: {
        ...portfolio?.documents,
        [body.locale]: content,
      },
      createdAt: portfolio?.createdAt ?? now,
      updatedAt: now,
    };
    return HttpResponse.json(portfolio);
  }),

  http.get('/api/skills', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const group = params.get('group');
    let result = [...skills];
    if (group !== null) result = result.filter((s) => s.group === group);
    result.sort(
      (a, b) =>
        skillNameKey(a.name).localeCompare(skillNameKey(b.name)) || a.id - b.id,
    );
    const { items, total } = pageOf(result, params);
    return HttpResponse.json({ skills: items, total });
  }),

  http.post('/api/skills', async ({ request }) => {
    const body = (await request.json()) as SkillCreate;
    const name = body.name.trim().replace(/\s+/g, ' ');
    if (skills.some((s) => skillNameKey(s.name) === skillNameKey(name))) {
      return conflictJson('conflict', `skill '${name}' already exists`);
    }
    const now = new Date().toISOString();
    const skill: Skill = {
      id: nextSkillId++,
      name,
      group: body.group,
      labels: body.labels ?? {},
      createdAt: now,
      updatedAt: now,
    };
    skills.push(skill);
    return HttpResponse.json(skill, { status: 201 });
  }),

  http.get('/api/skills/:id', ({ params }) => {
    const skill = skills.find((s) => s.id === Number(params.id));
    if (!skill) {
      return notFoundJson('Skill not found');
    }
    return HttpResponse.json(skill);
  }),

  http.patch('/api/skills/:id', async ({ params, request }) => {
    const skill = skills.find((s) => s.id === Number(params.id));
    if (!skill) {
      return notFoundJson('Skill not found');
    }
    const body = (await request.json()) as SkillPatch;
    if (body.name != null) {
      const name = body.name.trim().replace(/\s+/g, ' ');
      const clash = skills.some(
        (s) => s.id !== skill.id && skillNameKey(s.name) === skillNameKey(name),
      );
      if (clash) {
        return conflictJson('conflict', `skill '${name}' already exists`);
      }
      skill.name = name;
    }
    if (body.group != null) skill.group = body.group;
    if (body.labels != null) skill.labels = { ...body.labels };
    skill.updatedAt = new Date().toISOString();
    return HttpResponse.json(skill);
  }),

  http.delete('/api/skills/:id', ({ params }) => {
    const index = skills.findIndex((s) => s.id === Number(params.id));
    if (index === -1) {
      return notFoundJson('Skill not found');
    }
    skills.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/facts', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const category = params.get('category');
    const result =
      category === null
        ? [...profileFacts]
        : profileFacts.filter((f) => f.category === category);
    const { items, total } = pageOf(result, params);
    return HttpResponse.json({ facts: items, total });
  }),

  http.get('/api/facts/:key', ({ params }) => {
    const fact = profileFacts.find((f) => f.key === params.key);
    if (!fact) {
      return notFoundJson('Profile fact not found');
    }
    return HttpResponse.json(fact);
  }),

  http.put('/api/facts/:key', async ({ params, request }) => {
    const body = (await request.json()) as ProfileFactUpsert;
    const key = String(params.key).toLowerCase();
    const now = new Date().toISOString();
    const existing = profileFacts.find((f) => f.key === key);
    const fact: ProfileFact = {
      key,
      category: body.category,
      value: body.value,
      sensitivity: body.sensitivity ?? 'normal',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    profileFacts = [
      ...profileFacts.filter((f) => f.key !== key),
      fact,
    ].toSorted((a, b) => a.key.localeCompare(b.key));
    return HttpResponse.json(fact);
  }),

  http.delete('/api/facts/:key', ({ params }) => {
    const index = profileFacts.findIndex((f) => f.key === params.key);
    if (index === -1) {
      return notFoundJson('Profile fact not found');
    }
    profileFacts.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/skill-group-labels', () => {
    return HttpResponse.json({
      groups: skillGroupLabels.map((entry) => ({
        ...entry,
        labels: { ...entry.labels },
      })),
    });
  }),

  http.put('/api/skill-group-labels/:group', async ({ params, request }) => {
    const group = String(params.group);
    const entry = skillGroupLabels.find((e) => e.group === group);
    if (!entry) {
      return notFoundJson('Skill group not found');
    }
    const body = (await request.json()) as { labels: Record<string, string> };
    entry.labels = { ...body.labels };
    return HttpResponse.json({
      group: entry.group,
      labels: { ...entry.labels },
    });
  }),

  http.post('/api/applications/:id/apply', ({ params }) => {
    const application = findApplication(Number(params.id));
    if (application instanceof Response) return application;
    if (application.status !== 'saved') {
      return conflictJson(
        'apply_conflict',
        'Only saved applications can be queued for auto-apply',
      );
    }
    drainApplyRuns();
    if (
      applyRuns.some(
        (r) =>
          r.applicationId === application.id &&
          ACTIVE_APPLY_STATUSES.has(r.status),
      )
    ) {
      return conflictJson(
        'apply_conflict',
        'An active apply run already exists',
      );
    }
    const now = new Date().toISOString();
    const run: ApplyRun = {
      id: nextApplyRunId++,
      applicationId: application.id,
      jobId: application.jobId,
      status: 'queued',
      provider: 'greenhouse',
      attempt: 0,
      formFields: [],
      proposedAnswers: {},
      artifacts: {},
      result: null,
      error: null,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    applyRuns.push(run);
    pushAppEvent(application.id, 'apply_enqueued', { run_id: run.id });
    return HttpResponse.json(run, { status: 201 });
  }),

  http.get('/api/apply-runs', ({ request }) => {
    drainApplyRuns();
    const params = new URL(request.url).searchParams;
    let result = [...applyRuns].toSorted((a, b) => b.id - a.id);
    const status = params.get('status');
    const applicationId = params.get('application_id');
    if (status) result = result.filter((r) => r.status === status);
    if (applicationId) {
      result = result.filter((r) => r.applicationId === Number(applicationId));
    }
    const { items, total } = pageOf(result, params);
    return HttpResponse.json({ runs: items, total });
  }),

  http.get('/api/apply-runs/:id', ({ params }) => {
    const run = findApplyRun(Number(params.id));
    if (run instanceof Response) return run;
    return HttpResponse.json(run);
  }),

  http.patch('/api/apply-runs/:id', async ({ params, request }) => {
    const run = findApplyRun(Number(params.id));
    if (run instanceof Response) return run;
    const body = (await request.json()) as ApplyRunReview;
    const outcome = applyRunReview(run, body);
    if (outcome instanceof Response) return outcome;
    return HttpResponse.json(outcome);
  }),

  http.post('/api/apply-runs/:id/redraft', ({ params }) => {
    const run = findApplyRun(Number(params.id));
    if (run instanceof Response) return run;
    const outcome = redraftApplyRun(run, new Date().toISOString());
    if (outcome instanceof Response) return outcome;
    applyRuns = applyRuns.map((r) => (r.id === run.id ? outcome : r));
    return HttpResponse.json(outcome);
  }),

  http.get('/api/apply-runs/:id/artifacts/:name', ({ params }) => {
    const run = findApplyRun(Number(params.id));
    if (run instanceof Response) return run;
    const name = String(params.name);
    if (!(name in run.artifacts)) {
      return notFoundJson('Artifact not found');
    }
    const artifact = applyArtifactTexts.get(`${run.id}:${name}`);
    if (artifact === undefined) {
      return notFoundJson('Artifact not found');
    }
    return HttpResponse.json(artifact);
  }),
];

// Appended last by the browser worker in production builds only: any /api/*
// request without a real handler fails as a network error, so the public demo
// can never reach the backend. First-match wins, so real handlers take
// precedence.
export const unhandledApiGuard = http.all('/api/*', () => HttpResponse.error());
