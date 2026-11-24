import { HttpResponse, http } from 'msw';
import { skillNameKey } from '../services/skills';
import type {
  Application,
  ApplicationCreate,
  ApplicationUpdate,
} from '../services/types/application';
import type {
  IngestionRun,
  IngestionRunTrigger,
} from '../services/types/ingestion';
import type {
  Job,
  JobCreate,
  JobFilter,
  JobPatch,
} from '../services/types/job';
import type { MatchResult } from '../services/types/match';
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
  seedApplications,
  seedIngestionRuns,
  seedJobs,
  seedPortfolio,
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

export function resetMockData() {
  jobs = [...seedJobs];
  applications = [...seedApplications];
  portfolio = { ...seedPortfolio };
  resumes = [seedResume, seedResumeDraft];
  skills = [...seedSkills];
  ingestionRuns = [...seedIngestionRuns];
  nextIngestionRunId = 100;
  skillGroupLabels = seedSkillGroupLabels.map((entry) => ({
    ...entry,
    labels: { ...entry.labels },
  }));
  nextJobId = 100;
  nextApplicationId = 100;
  nextResumeId = 100;
  nextSkillId = 100;
}

function ageInDays(postedAt: string | null): number {
  if (!postedAt) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(postedAt).getTime()) / 86400000;
}

const notFoundJson = (message: string) =>
  HttpResponse.json({ error: { code: 'not_found', message } }, { status: 404 });

const conflictJson = (code: string, message: string) =>
  HttpResponse.json({ error: { code, message } }, { status: 409 });

function applyProfilePreset(result: Job[], rules: Portfolio['filters']): Job[] {
  if (rules.levels.length > 0)
    result = result.filter((j) => rules.levels.includes(j.level));
  if (rules.areas.length > 0)
    result = result.filter((j) => rules.areas.includes(j.area));
  if (rules.locations.length > 0)
    result = result.filter((j) =>
      rules.locations.some((loc) =>
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
    content.basics.headline,
    content.basics.subtitle,
    ...content.basics.links.map((l) => l.url),
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
    return HttpResponse.json({ jobs: items, total });
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
    return HttpResponse.json(job, { status: 201 });
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
    return HttpResponse.json(job);
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    const job = jobs.find((j) => j.id === Number(params.id));
    if (!job) {
      return notFoundJson('Job not found');
    }
    const body = (await request.json()) as JobPatch;
    Object.assign(job, body);
    return HttpResponse.json(job);
  }),

  http.get('/api/applications', ({ request }) => {
    const params = new URL(request.url).searchParams;
    let result = [...applications];
    const status = params.get('status');
    const jobId = params.get('jobId');
    if (status) result = result.filter((a) => a.status === status);
    if (jobId) result = result.filter((a) => a.jobId === Number(jobId));
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
      portfolioId: portfolio?.id ?? 1,
      statusChangedAt: now,
      createdAt: now,
      jobId: body.jobId,
    };
    applications.push(app);
    return HttpResponse.json(app, { status: 201 });
  }),

  http.get('/api/applications/:id', ({ params }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    return HttpResponse.json(app);
  }),

  http.patch('/api/applications/:id', async ({ params, request }) => {
    const app = findApplication(Number(params.id));
    if (app instanceof Response) return app;
    const body = (await request.json()) as ApplicationUpdate;
    Object.assign(app, body, { statusChangedAt: new Date().toISOString() });
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
    if (body.name !== undefined) {
      const name = body.name.trim().replace(/\s+/g, ' ');
      const clash = skills.some(
        (s) => s.id !== skill.id && skillNameKey(s.name) === skillNameKey(name),
      );
      if (clash) {
        return conflictJson('conflict', `skill '${name}' already exists`);
      }
      skill.name = name;
    }
    if (body.group !== undefined) skill.group = body.group;
    if (body.labels !== undefined) skill.labels = { ...body.labels };
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
];

// Appended last by the browser worker in production builds only: any /api/*
// request without a real handler fails as a network error, so the public demo
// can never reach the backend. First-match wins, so real handlers take
// precedence.
export const unhandledApiGuard = http.all('/api/*', () => HttpResponse.error());
