declare module 'virtual:portfolio-content' {
  import type { ContentEntry, ProjectEntry } from './content';
  import type { Locale } from './i18n';

  export const content: Record<
    Locale,
    {
      projects: ProjectEntry[];
      workExperience: ContentEntry[];
    }
  >;
}
