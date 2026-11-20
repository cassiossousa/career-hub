export const routePaths = {
  dashboard: '/',
  jobs: '/jobs',
  jobDetail: (id: string) => `/jobs/${id}`,
  applications: '/applications',
  applicationDetail: (id: string) => `/applications/${id}`,
  portfolio: '/portfolio',
  skills: '/skills',
} as const;
