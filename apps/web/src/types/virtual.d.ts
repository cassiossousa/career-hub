declare module 'virtual:portfolio-content' {
  export const content: Record<
    import('./i18n').Locale,
    {
      projects: import('./content').ProjectEntry[];
      workExperience: import('./content').ContentEntry[];
    }
  >;
}
