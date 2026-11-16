import { defineMessages, Translation, yearsSince } from '../../types/i18n';

const en: Translation = {
  navigation: {
    home: 'Home',
    footerLabel: 'Footer navigation',
    toggleMenu: 'Toggle menu',
    switchToEnglish: 'Switch to English',
    switchToPortuguese: 'Switch to Portuguese',
  },

  links: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    demo: 'Demo',
    liveDemo: 'Live Demo',
  },

  home: {
    name: 'Cássio dos Santos Sousa',
    title: 'Senior Software Engineer',
    subtitle: 'Frontend Architecture • Large-Scale Web Platforms',
    username: 'cassiossousa',
  },

  workExperience: {
    title: 'Work Experience',
    present: 'Present',
  },

  skills: {
    title: 'Technical Skills',
    frontend: 'Frontend',
    backend: 'Backend',
    databases: 'Databases',
    distributed: 'Distributed Systems',
    cloud: 'Cloud & Infrastructure',
    testing: 'Testing & Observability',
  },

  resume: {
    title: 'Resume',
    printAction: 'Print / Save as PDF',
    printInstructions:
      "Use your browser's print dialog to print or save this resume as PDF.",
    summaryTitle: 'Professional Summary',
    summary: `Senior Software Engineer with ${yearsSince(2016)}+ years of experience building and operating large-scale, high-traffic web applications using React, TypeScript, and modern frontend architectures. Proven track record owning user-facing features end-to-end, from technical design and implementation to performance optimization and production support. Strong background in frontend system design, code health, testing strategies, and observability, with experience collaborating closely with Product, Design, Backend, and Data teams in distributed environments. Fluent in English and experienced mentoring engineers and leading frontend teams.`,
    experienceTitle: 'Work Experience',
    languagesTitle: 'Languages',
    languages: {
      portuguese: 'Portuguese - Native',
      english: 'English - Fluent',
    },
  },

  projects: {
    title: 'Projects',
    description:
      'Selected projects demonstrating system design, frontend architecture, and scalable product development.',
    notFound: 'Project not found',
    backToProjects: 'Back to projects',
    highlights: 'Highlights',
    stars: 'stars',
  },
};

export default defineMessages(en);
