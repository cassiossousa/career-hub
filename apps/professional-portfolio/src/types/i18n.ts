export type Locale = 'en' | 'pt-BR';

// Define translation structure
export interface Translation {
  navigation: {
    home: string;
    footerLabel: string;
    toggleMenu: string;
    switchToEnglish: string;
    switchToPortuguese: string;
  };

  links: {
    github: string;
    linkedin: string;
    demo: string;
    liveDemo: string;
  };

  home: {
    name: string;
    title: string;
    subtitle: string;
    username: string;
  };

  workExperience: {
    title: string;
    present: string;
  };

  skills: {
    title: string;
    frontend: string;
    backend: string;
    databases: string;
    distributed: string;
    cloud: string;
    testing: string;
  };

  resume: {
    title: string;
    printAction: string;
    printInstructions: string;
    summaryTitle: string;
    summary: string;
    experienceTitle: string;
    languagesTitle: string;
    languages: {
      portuguese: string;
      english: string;
    };
  };

  projects: {
    title: string;
    description: string;
    notFound: string;
    backToProjects: string;
    highlights: string;
    stars: string;
  };
}

export function defineMessages(messages: Translation) {
  return messages;
}

export function yearsSince(givenYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - givenYear;
}
