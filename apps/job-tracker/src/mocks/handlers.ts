import { HttpResponse, http } from 'msw';
import type {
  ApplicationCreate,
  ApplicationUpdate,
} from '../services/types/application';
import type {
  Job,
  JobCreate,
  JobFilter,
  JobStats,
  JobUpdate,
} from '../services/types/job';
import type { Portfolio, PortfolioCreate } from '../services/types/portfolio';
import { seedApplications, seedJobs, seedPortfolio, toJob } from './data';

let jobs: Job[] = [...seedJobs];
let applications = [...seedApplications];
let portfolio: Portfolio = { ...seedPortfolio };
let nextJobId = 100;
let nextApplicationId = 100;

export function resetMockData() {
  jobs = [...seedJobs];
  applications = [...seedApplications];
  portfolio = { ...seedPortfolio };
  nextJobId = 100;
  nextApplicationId = 100;
}

function ageInDays(postedAt: string | null): number {
  if (!postedAt) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(postedAt).getTime()) / 86400000;
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
  const minMatchScore = filter.minMatchScore;
  if (minMatchScore !== undefined)
    result = result.filter(
      (j) => j.matchScore !== null && j.matchScore >= minMatchScore,
    );
  const maxAgeDays = filter.maxAgeDays;
  if (maxAgeDays !== undefined)
    result = result.filter((j) => ageInDays(j.postedAt) <= maxAgeDays);

  const sort = filter.sort ?? 'posted_desc';
  result.sort((a, b) => {
    if (sort === 'match_score_desc')
      return (b.matchScore ?? -1) - (a.matchScore ?? -1);
    if (sort === 'match_score_asc')
      return (a.matchScore ?? 999) - (b.matchScore ?? 999);
    return (
      new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime()
    );
  });
  return result;
}

function jobStats(): JobStats {
  const filtered: JobStats['filtered'] = {
    unevaluated: 0,
    passed: 0,
    filtered_level: 0,
    filtered_location: 0,
    filtered_area: 0,
    filtered_remote: 0,
    filtered_age: 0,
  };
  for (const j of jobs) filtered[j.filterResult] += 1;
  const scores = jobs
    .map((j) => j.matchScore)
    .filter((s): s is number => s !== null);
  return {
    total: jobs.length,
    bySource: jobs.reduce<JobStats['bySource']>((acc, j) => {
      acc[j.source] = (acc[j.source] ?? 0) + 1;
      return acc;
    }, {}),
    byLevel: jobs.reduce<JobStats['byLevel']>((acc, j) => {
      acc[j.level] = (acc[j.level] ?? 0) + 1;
      return acc;
    }, {}),
    byArea: jobs.reduce<JobStats['byArea']>((acc, j) => {
      acc[j.area] = (acc[j.area] ?? 0) + 1;
      return acc;
    }, {}),
    filtered,
    applicationsByStatus: applications.reduce<Record<string, number>>(
      (acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
      },
      {},
    ),
    avgMatchScore:
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null,
    jobsByAge: {
      lessThanOneDay: jobs.filter((j) => ageInDays(j.postedAt) < 1).length,
      oneToSevenDays: jobs.filter((j) => {
        const d = ageInDays(j.postedAt);
        return d >= 1 && d < 7;
      }).length,
      sevenToThirtyDays: jobs.filter((j) => {
        const d = ageInDays(j.postedAt);
        return d >= 7 && d < 30;
      }).length,
      overThirtyDays: jobs.filter((j) => ageInDays(j.postedAt) >= 30).length,
    },
  };
}

const notFoundJson = (message: string) =>
  HttpResponse.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });

export const handlers = [
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
      minMatchScore: params.get('minMatchScore')
        ? Number(params.get('minMatchScore'))
        : undefined,
      maxAgeDays: params.get('maxAgeDays')
        ? Number(params.get('maxAgeDays'))
        : undefined,
      sort: (params.get('sort') as JobFilter['sort']) ?? undefined,
      preset: (params.get('preset') as JobFilter['preset']) ?? undefined,
    };
    return HttpResponse.json({ jobs: filterJobs(filter) });
  }),

  http.get('/api/jobs/stats', () => HttpResponse.json(jobStats())),

  http.get('/api/jobs/:id', ({ params }) => {
    const job = jobs.find((j) => j.id === Number(params.id));
    if (!job) {
      return notFoundJson('Job not found');
    }
    return HttpResponse.json({ job });
  }),

  http.post('/api/jobs', async ({ request }) => {
    const body = (await request.json()) as JobCreate;
    const job = toJob(body, nextJobId++);
    jobs.push(job);
    return HttpResponse.json({ job }, { status: 201 });
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    const job = jobs.find((j) => j.id === Number(params.id));
    if (!job) {
      return notFoundJson('Job not found');
    }
    const body = (await request.json()) as JobUpdate;
    Object.assign(job, body);
    return HttpResponse.json({ job });
  }),

  http.get('/api/applications', ({ request }) => {
    const params = new URL(request.url).searchParams;
    let result = [...applications];
    const status = params.get('status');
    const jobId = params.get('jobId');
    if (status) result = result.filter((a) => a.status === status);
    if (jobId) result = result.filter((a) => a.jobId === Number(jobId));
    return HttpResponse.json({ applications: result });
  }),

  http.post('/api/applications', async ({ request }) => {
    const body = (await request.json()) as ApplicationCreate;
    const now = new Date().toISOString();
    const app = {
      id: nextApplicationId++,
      status: body.status ?? 'saved',
      notes: body.notes ?? null,
      appliedAt: body.appliedAt ?? null,
      portfolioId: 1,
      statusChangedAt: now,
      createdAt: now,
      jobId: body.jobId,
    };
    applications.push(app);
    return HttpResponse.json({ application: app }, { status: 201 });
  }),

  http.patch('/api/applications/:id', async ({ params, request }) => {
    const app = applications.find((a) => a.id === Number(params.id));
    if (!app) {
      return notFoundJson('Application not found');
    }
    const body = (await request.json()) as ApplicationUpdate;
    Object.assign(app, body, { statusChangedAt: new Date().toISOString() });
    return HttpResponse.json({ application: app });
  }),

  http.get('/api/portfolio', () => HttpResponse.json({ portfolio })),

  http.put('/api/portfolio', async ({ request }) => {
    const body = (await request.json()) as PortfolioCreate;
    portfolio = {
      id: portfolio.id,
      ...body,
      createdAt: portfolio.createdAt,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ portfolio });
  }),
];
