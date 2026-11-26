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
const ApplicationHub = lazy(() =>
  import('../features/applications/ApplicationHub').then((m) => ({
    default: m.ApplicationHub,
  })),
);
const SkillsEditor = lazy(() =>
  import('../features/skills/SkillsEditor').then((m) => ({
    default: m.SkillsEditor,
  })),
);
const FactsEditor = lazy(() =>
  import('../features/facts/FactsEditor').then((m) => ({
    default: m.FactsEditor,
  })),
);
const ApplyQueue = lazy(() =>
  import('../features/apply/ApplyQueue').then((m) => ({
    default: m.ApplyQueue,
  })),
);
const ApplyRunReview = lazy(() =>
  import('../features/apply/ApplyRunReview').then((m) => ({
    default: m.ApplyRunReview,
  })),
);
const SettingsEditor = lazy(() =>
  import('../features/settings/SettingsEditor').then((m) => ({
    default: m.SettingsEditor,
  })),
);
const IngestionDashboard = lazy(() =>
  import('../features/ingestion/IngestionDashboard').then((m) => ({
    default: m.IngestionDashboard,
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
  { path: routePaths.applicationDetail(':id'), Component: ApplicationHub },
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
  {
    path: routePaths.skills,
    Component: SkillsEditor,
    navLabel: (nav) => nav.skills,
  },
  {
    path: routePaths.facts,
    Component: FactsEditor,
    navLabel: (nav) => nav.facts,
  },
  {
    path: routePaths.apply,
    Component: ApplyQueue,
    navLabel: (nav) => nav.apply,
  },
  { path: routePaths.applyRun(':id'), Component: ApplyRunReview },
  {
    path: routePaths.settings,
    Component: SettingsEditor,
    navLabel: (nav) => nav.settings,
  },
  {
    path: routePaths.ingestion,
    Component: IngestionDashboard,
    navLabel: (nav) => nav.ingestion,
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
