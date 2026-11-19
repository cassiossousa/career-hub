import { type ComponentType, lazy } from 'react';
import type { Translation } from '../types/i18n';
import { routePaths } from './routePaths';

const Dashboard = lazy(() =>
  import('../features/dashboard/Dashboard').then((m) => ({
    default: m.Dashboard,
  })),
);
const JobList = lazy(() =>
  import('../features/jobs/JobList').then((m) => ({ default: m.JobList })),
);
const JobDetail = lazy(() =>
  import('../features/jobs/JobDetail').then((m) => ({ default: m.JobDetail })),
);
const ApplicationList = lazy(() =>
  import('../features/applications/ApplicationList').then((m) => ({
    default: m.ApplicationList,
  })),
);
const PortfolioEditor = lazy(() =>
  import('../features/portfolio/PortfolioEditor').then((m) => ({
    default: m.PortfolioEditor,
  })),
);

export interface AppRoute {
  path: string;
  Component: ComponentType;
  navLabel?: (nav: Translation['navigation']) => string;
}

export const appRoutes: AppRoute[] = [
  {
    path: routePaths.dashboard,
    Component: Dashboard,
    navLabel: (nav) => nav.dashboard,
  },
  {
    path: routePaths.jobs,
    Component: JobList,
    navLabel: (nav) => nav.jobs,
  },
  { path: routePaths.jobDetail(':id'), Component: JobDetail },
  {
    path: routePaths.applications,
    Component: ApplicationList,
    navLabel: (nav) => nav.applications,
  },
  {
    path: routePaths.portfolio,
    Component: PortfolioEditor,
    navLabel: (nav) => nav.portfolio,
  },
];

export interface NavItem {
  path: string;
  label: string;
}

export function getNavItems(nav: Translation['navigation']): NavItem[] {
  return appRoutes.flatMap((route) =>
    route.navLabel === undefined
      ? []
      : [{ path: route.path, label: route.navLabel(nav) }],
  );
}
