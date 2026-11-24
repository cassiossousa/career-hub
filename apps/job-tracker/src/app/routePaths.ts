export const routePaths = {
  dashboard: '/',
  jobs: '/jobs',
  jobDetail: (id: string) => `/jobs/${id}`,
  applications: '/applications',
  applicationDetail: (id: string) => `/applications/${id}`,
  portfolio: '/portfolio',
  skills: '/skills',
  settings: '/settings',
  ingestion: '/ingestion',
} as const;

export const publicRoutePaths = [
  routePaths.dashboard,
  routePaths.jobs,
  routePaths.applications,
  routePaths.portfolio,
  routePaths.skills,
  routePaths.settings,
  routePaths.ingestion,
] as const;
