import type { Translation } from '../types/i18n';

export const routePaths = {
  home: '/',
  workExperience: '/work-experience',
  projects: '/projects',
  projectDetails: '/projects/:slug',
  resume: '/resume',
} as const;

export const publicRoutePaths = [
  routePaths.home,
  routePaths.workExperience,
  routePaths.projects,
  routePaths.resume,
] as const;

export const navigationItems = [
  {
    to: routePaths.home,
    label: (messages: Translation) => messages.navigation.home,
  },
  {
    to: routePaths.workExperience,
    label: (messages: Translation) => messages.workExperience.title,
  },
  {
    to: routePaths.projects,
    label: (messages: Translation) => messages.projects.title,
  },
  {
    to: routePaths.resume,
    label: (messages: Translation) => messages.resume.title,
  },
] satisfies {
  to: string;
  label: (messages: Translation) => string;
}[];
